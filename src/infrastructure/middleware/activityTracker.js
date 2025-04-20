const axios = require('axios');
const logger = require('../logger');
const crypto = require('crypto');

// Visualization service configuration
const VISUALIZATION_SERVICE_URL = process.env.VISUALIZATION_SERVICE_URL || 'http://localhost:3006';

// Generate a unique ID for each request
function generateRequestId() {
    return crypto.randomBytes(8).toString('hex');
}

// Function to send layer activity update with enhanced details
async function sendLayerActivity(layerId, status, details = {}) {
    try {
        const payload = {
            layerId,
            status,
            ...details
        };
        
        const response = await axios.post(`${VISUALIZATION_SERVICE_URL}/api/layer-activity`, payload);
        logger.info(`Layer activity sent: ${layerId} - ${status}`, { details, requestId: details.requestId });
        return response.data.requestId;
    } catch (error) {
        logger.error(`Failed to send layer activity: ${error.message}`);
        return details.requestId;
    }
}

// Function to send database activity update with operation details
async function sendDatabaseActivity(dbId, status, operation = null) {
    try {
        await axios.post(`${VISUALIZATION_SERVICE_URL}/api/db-activity`, {
            dbId,
            status,
            operation
        });
        logger.info(`Database activity sent: ${dbId} - ${status}${operation ? ` (${operation})` : ''}`);
    } catch (error) {
        logger.error(`Failed to send database activity: ${error.message}`);
    }
}

// Mapping of URL patterns to components and operations
const componentMapping = {
    // Presentation layer components
    'presentation': {
        'routes': {
            pattern: /^\/api\/.+/,
            operation: 'Routing API request'
        },
        'controllers': {
            pattern: /^\/api\/(users|courses|payments)/,
            operation: 'Processing controller action'
        },
        'views': {
            pattern: /^\/((?!api).+|$)/,
            operation: 'Rendering view'
        }
    },
    // Application layer components
    'application': {
        'services': {
            pattern: /^\/api\/(users|courses|payments)(\/[^\/]+)?$/,
            operation: 'Executing service operation'
        },
        'usecases': {
            pattern: /^\/api\/((users\/auth)|(courses\/(enroll|search))|(payments\/process))/,
            operation: 'Processing business use case'
        },
        'logic': {
            pattern: /^\/api\/.+/,
            operation: 'Applying application logic'
        }
    },
    // Domain layer components
    'domain': {
        'entities': {
            pattern: /^\/api\/(users|courses|payments)(\/[^\/]+)?$/,
            operation: 'Managing entity state'
        },
        'valueobjects': {
            pattern: /^\/api\/((payments)|(courses\/rating))/,
            operation: 'Processing value objects'
        },
        'domainservices': {
            pattern: /^\/api\/.+/,
            operation: 'Executing domain service'
        }
    },
    // Infrastructure layer components
    'infrastructure': {
        'repositories': {
            pattern: /^\/api\/(users|courses|payments)/,
            operation: 'Accessing data repository'
        },
        'externalservices': {
            pattern: /^\/api\/((payments)|(users\/google-auth))/,
            operation: 'Calling external service'
        },
        'dbaccess': {
            pattern: /^\/api\/.+/,
            operation: 'Performing database operation'
        }
    }
};

// Middleware to track layer activity with enhanced details
const trackLayerActivity = (layerId) => {
    const minTimeBetweenRequests = 15000; // Dramatically increased to 15 seconds between requests
    let lastRequestTime = 0;
    const activeRequests = new Map();
    
    return async (req, res, next) => {
        const now = Date.now();
        const path = req.originalUrl || req.url;
        
        // Special handling for login and payment operations
        const isLoginOperation = path.includes('/api/users/login');
        const isPaymentOperation = path.includes('/api/payments');
        
        // If this is the presentation layer and we've had a recent request, wait a bit
        if (layerId === 'presentation' && now - lastRequestTime < minTimeBetweenRequests) {
            const delay = minTimeBetweenRequests - (now - lastRequestTime);
            logger.info(`Delaying visualization for ${delay}ms to prevent overlap`);
            
            // For presentation layer, update the last request time
            lastRequestTime = now + delay;
            
            // Delay the visualization but don't delay the actual request processing
            setTimeout(async () => {
                await sendVisualizationUpdate(req, layerId, 'active', path);
            }, delay);
        } else {
            // For presentation layer, update the last request time
            if (layerId === 'presentation') {
                lastRequestTime = now;
            }
            
            // Track this request as active
            activeRequests.set(req.visualizationRequestId, {
                path,
                timestamp: now,
                isLoginOperation,
                isPaymentOperation
            });
            
            // Send visualization update immediately
            await sendVisualizationUpdate(req, layerId, 'active', path);
        }
        
        // Store the original end function
        const originalEnd = res.end;
        
        // Override the end function
        res.end = async function(chunk, encoding) {
            // Remove this request from active requests
            activeRequests.delete(req.visualizationRequestId);
            
            // Wait a bit before marking this layer as inactive to ensure the visualization flows smoothly
            const layerDelay = getLayerDelay(layerId, isLoginOperation, isPaymentOperation);
            
            // Add an extra staggered delay based on layer type to prevent layers from completing at the same time
            // This ensures layers finish processing in a predictable sequence with clear timing between them
            let extraDelay = 0;
            if (layerId === 'presentation') {
                extraDelay = 15000; // Presentation layer stays active longest
            } else if (layerId === 'application') {
                extraDelay = 10000; // Application layer next
            } else if (layerId === 'domain') {
                extraDelay = 5000;  // Domain layer next
            } else if (layerId === 'infrastructure') {
                extraDelay = 0;     // Infrastructure layer deactivates first
            }
            
            setTimeout(async () => {
                // Mark layer as inactive after response and additional delay
                await sendVisualizationUpdate(req, layerId, 'inactive', path);
            }, layerDelay + extraDelay);
            
            // Call the original end function
            originalEnd.call(this, chunk, encoding);
        };
        
        next();
    };
    
    // Helper function to send the visualization update
    async function sendVisualizationUpdate(req, layerId, status, path) {
        // Determine component and operation based on request
        const { component, operation } = determineComponentAndOperation(layerId, req, path);
        
        // Send the update
        await sendLayerActivity(layerId, status, {
            component,
            operation: status === 'active' ? operation : null,
            requestId: req.visualizationRequestId,
            path: path,
            statusCode: req.res ? req.res.statusCode : null
        });
        
        // Only log active states, skip logging inactive states
        if (status === 'active') {
            // Log the activity with request ID
            logger.info(`${layerId.charAt(0).toUpperCase() + layerId.slice(1)} layer: ${operation}`, { 
                requestId: req.visualizationRequestId,
                path: path
            });
        }
    }
    
    // Helper function to get appropriate delay for each layer
    function getLayerDelay(layerId, isLoginOperation, isPaymentOperation) {
        // Base delays for different layers - significantly increased
        const baseDelays = {
            'presentation': 12000,    // Increased to 12 seconds
            'application': 11000,     // Increased to 11 seconds
            'domain': 10000,          // Increased to 10 seconds
            'infrastructure': 9000    // Increased to 9 seconds
        };
        
        // Additional delay for login and payment operations
        const specialOperationDelay = (isLoginOperation || isPaymentOperation) ? 5000 : 0; // Increased to 5 seconds
        
        return baseDelays[layerId] + specialOperationDelay;
    }
};

// Helper function to determine component and operation based on request path
function determineComponentAndOperation(layerId, req, path) {
    path = path || req.originalUrl || req.url;
    const method = req.method;
    
    // Default values
    let component = null;
    let operation = null;
    
    // Check if we have mappings for this layer
    if (componentMapping[layerId]) {
        // Find the first matching component based on URL pattern
        for (const [compId, config] of Object.entries(componentMapping[layerId])) {
            if (config.pattern.test(path)) {
                component = compId;
                
                // Get operation based on HTTP method and pattern
                if (typeof config.operation === 'string') {
                    operation = config.operation;
                } else if (typeof config.operation === 'function') {
                    operation = config.operation(req);
                }
                
                // Add HTTP method to operation
                operation = operation ? `${operation} (${method})` : `${method} request`;
                
                break;
            }
        }
    }
    
    // If no specific component matched, use default for the layer
    if (!component) {
        switch(layerId) {
            case 'presentation':
                component = 'controllers';
                operation = `Processing ${method} request`;
                break;
            case 'application':
                component = 'services';
                operation = 'Executing service logic';
                break;
            case 'domain':
                component = 'entities';
                operation = 'Processing domain logic';
                break;
            case 'infrastructure':
                component = 'repositories';
                operation = 'Data access operation';
                break;
        }
    }
    
    return { component, operation };
}

// Function to determine database operations based on path
function determineDatabaseOperation(dbId, req) {
    const path = req.originalUrl || req.url;
    const method = req.method;
    
    let operation = 'Database operation';
    
    switch(method) {
        case 'GET':
            operation = 'Reading data';
            break;
        case 'POST':
            operation = 'Creating data';
            break;
        case 'PUT':
        case 'PATCH':
            operation = 'Updating data';
            break;
        case 'DELETE':
            operation = 'Deleting data';
            break;
    }
    
    // More specific database operations based on path and database
    if (dbId === 'users-db') {
        if (path.includes('/auth')) {
            operation = 'Authentication';
        } else if (path.includes('/profile')) {
            operation = 'User profile ' + (method === 'GET' ? 'retrieval' : 'update');
        } else {
            operation += ' (User records)';
        }
    } else if (dbId === 'courses-db') {
        if (path.includes('/enroll')) {
            operation = 'Course enrollment';
        } else if (path.includes('/search')) {
            operation = 'Course search';
        } else if (path.includes('/rating')) {
            operation = 'Course rating update';
        } else {
            operation += ' (Course data)';
        }
    } else if (dbId === 'payments-db') {
        if (path.includes('/process')) {
            operation = 'Payment processing';
        } else if (path.includes('/verify')) {
            operation = 'Payment verification';
        } else {
            operation += ' (Payment information)';
        }
    }
    
    return operation;
}

// Middleware to track database activity with enhanced details
const trackDatabaseActivity = (dbId) => {
    return async (req, res, next) => {
        // Skip payment database activation for GET requests on course routes
        if (dbId === 'payments-db' && req.method === 'GET' && 
            (req.originalUrl.includes('/courses/') || req.originalUrl.includes('/courseManagement/'))) {
            // Don't activate payment database for course viewing operations
            return next();
        }
        
        // Determine operation based on request
        const operation = determineDatabaseOperation(dbId, req);
        
        // Mark database as active
        await sendDatabaseActivity(dbId, 'active', operation);
        
        // Store the original end function
        const originalEnd = res.end;
        
        // Override the end function
        res.end = async function(chunk, encoding) {
            // Wait a bit before marking database as inactive
            setTimeout(async () => {
            // Mark database as inactive after response
            await sendDatabaseActivity(dbId, 'inactive');
            }, 12000); // Increased to 12 seconds for much slower visualization
            
            // Call the original end function
            originalEnd.call(this, chunk, encoding);
        };
        
        next();
    };
};

module.exports = {
    trackLayerActivity,
    trackDatabaseActivity
}; 