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
            pattern: /^\/api\/.+/,
            operation: 'Executing service operation'
        },
        'usecases': {
            pattern: /^\/api\/(users\/auth|courses\/enroll|payments\/process)/,
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
            pattern: /^\/api\/(users|courses|payments)/,
            operation: 'Managing entity state'
        },
        'valueobjects': {
            pattern: /^\/api\/(payments|courses\/rating)/,
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
            pattern: /^\/api\/(payments|users\/google-auth)/,
            operation: 'Calling external service'
        },
        'dbaccess': {
            pattern: /^\/api\/.+/,
            operation: 'Performing database operation'
        }
    }
};

// Helper function to determine component and operation based on request path
function determineComponentAndOperation(layerId, req) {
    const path = req.originalUrl || req.url;
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
    
    // Add more specific details based on path
    if (path.includes('/users')) {
        operation += ' (User records)';
    } else if (path.includes('/courses')) {
        operation += ' (Course data)';
    } else if (path.includes('/payments')) {
        operation += ' (Payment information)';
    }
    
    return operation;
}

// Middleware to track layer activity with enhanced details
const trackLayerActivity = (layerId) => {
    // Time to wait between requests for smoother visualization
    const minTimeBetweenRequests = 5000; // 5 seconds 
    let lastRequestTime = 0;
    
    return async (req, res, next) => {
        // Generate request ID that will be used across all layers
        req.visualizationRequestId = req.visualizationRequestId || generateRequestId();
        
        // Get current time
        const now = Date.now();
        
        // If this is the presentation layer and we've had a recent request, wait a bit
        if (layerId === 'presentation' && now - lastRequestTime < minTimeBetweenRequests) {
            const delay = minTimeBetweenRequests - (now - lastRequestTime);
            logger.info(`Delaying visualization for ${delay}ms to prevent overlap`);
            
            // For presentation layer, update the last request time
            lastRequestTime = now + delay;
            
            // Delay the visualization but don't delay the actual request processing
            setTimeout(async () => {
                await sendVisualizationUpdate(req, layerId, 'active');
            }, delay);
        } else {
            // For presentation layer, update the last request time
            if (layerId === 'presentation') {
                lastRequestTime = now;
            }
            
            // Send visualization update immediately
            await sendVisualizationUpdate(req, layerId, 'active');
        }
        
        // Store the original end function
        const originalEnd = res.end;
        
        // Override the end function
        res.end = async function(chunk, encoding) {
            // Wait a bit before marking this layer as inactive to ensure the visualization flows smoothly
            const layerDelay = getLayerDelay(layerId);
            
            setTimeout(async () => {
            // Mark layer as inactive after response
                await sendVisualizationUpdate(req, layerId, 'inactive');
            }, layerDelay);
            
            // Call the original end function
            originalEnd.call(this, chunk, encoding);
        };
        
        next();
    };
    
    // Helper function to send the visualization update
    async function sendVisualizationUpdate(req, layerId, status) {
        // Determine component and operation based on request
        const { component, operation } = determineComponentAndOperation(layerId, req);
        
        // Send the update
        await sendLayerActivity(layerId, status, {
            component,
            operation: status === 'active' ? operation : null,
            requestId: req.visualizationRequestId,
            path: req.originalUrl || req.url,
            statusCode: req.res ? req.res.statusCode : null
        });
    }
    
    // Helper function to get appropriate delay for each layer
    function getLayerDelay(layerId) {
        // Set different delays for different layers to create a cascade effect
        switch(layerId) {
            case 'presentation': return 3000; // 3 seconds
            case 'application': return 2500;
            case 'domain': return 2000;
            case 'infrastructure': return 1500;
            default: return 2000;
        }
    }
};

// Middleware to track database activity with enhanced details
const trackDatabaseActivity = (dbId) => {
    return async (req, res, next) => {
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
            }, 3000); // 3 second delay for smoother visualization
            
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