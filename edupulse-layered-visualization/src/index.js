const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const winston = require('winston');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "OPTIONS"]
    }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Configure Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// Store layer states with enhanced details
const layerStates = new Map([
    ['presentation', { 
        status: 'inactive', 
        lastActive: 0,
        components: {
            controllers: { status: 'inactive', lastActive: 0 },
            views: { status: 'inactive', lastActive: 0 },
            routes: { status: 'inactive', lastActive: 0 }
        },
        currentOperation: null
    }],
    ['application', { 
        status: 'inactive', 
        lastActive: 0,
        components: {
            services: { status: 'inactive', lastActive: 0 },
            usecases: { status: 'inactive', lastActive: 0 },
            logic: { status: 'inactive', lastActive: 0 }
        },
        currentOperation: null
    }],
    ['domain', { 
        status: 'inactive', 
        lastActive: 0,
        components: {
            entities: { status: 'inactive', lastActive: 0 },
            valueobjects: { status: 'inactive', lastActive: 0 },
            domainservices: { status: 'inactive', lastActive: 0 }
        },
        currentOperation: null
    }],
    ['infrastructure', { 
        status: 'inactive', 
        lastActive: 0,
        components: {
            repositories: { status: 'inactive', lastActive: 0 },
            externalservices: { status: 'inactive', lastActive: 0 },
            dbaccess: { status: 'inactive', lastActive: 0 }
        },
        currentOperation: null
    }]
]);

// Store database states with enhanced details
const dbStates = new Map([
    ['users-db', { 
        status: 'inactive', 
        lastActive: 0,
        operationCount: 0,
        lastOperation: null,
        connectedLayers: ['domain', 'infrastructure']
    }],
    ['courses-db', { 
        status: 'inactive', 
        lastActive: 0,
        operationCount: 0,
        lastOperation: null,
        connectedLayers: ['domain', 'infrastructure']
    }],
    ['payments-db', { 
        status: 'inactive', 
        lastActive: 0,
        operationCount: 0,
        lastOperation: null,
        connectedLayers: ['domain', 'infrastructure']
    }]
]);

// Track request flow for visualization
const activeRequests = new Map();
let requestCounter = 0;

// Statistics
const stats = {
    totalRequests: 0,
    dbOperations: 0,
    responseTimes: []
};

// Function to update layer status with component details
function updateLayerStatus(layerId, status, componentId = null, operation = null) {
    const layer = layerStates.get(layerId);
    if (layer) {
        const now = Date.now();
        layer.status = status;
        layer.lastActive = now;
        
        if (operation) {
            layer.currentOperation = operation;
        }
        
        if (componentId && layer.components[componentId]) {
            layer.components[componentId].status = status;
            layer.components[componentId].lastActive = now;
        }
        
        layerStates.set(layerId, layer);
        logger.info(`Layer ${layerId} status updated to ${status}${componentId ? ` (component: ${componentId})` : ''}${operation ? ` - ${operation}` : ''}`);
        
        // Broadcast the update to all connected clients with enhanced details
        io.emit('layer-update', { 
            layerId, 
            status, 
            component: componentId,
            operation,
            timestamp: now 
        });
    }
}

// Function to update database status with operation details
function updateDbStatus(dbId, status, operation = null) {
    const db = dbStates.get(dbId);
    if (db) {
        const now = Date.now();
        db.status = status;
        db.lastActive = now;
        
        if (operation) {
            db.lastOperation = operation;
        }
        
        if (status === 'active') {
            db.operationCount++;
            stats.dbOperations++;
            
            // Also update infrastructure layer dbaccess component when database is active
            const infraLayer = layerStates.get('infrastructure');
            if (infraLayer) {
                infraLayer.components.dbaccess.status = 'active';
                infraLayer.components.dbaccess.lastActive = now;
                
                // Broadcast specific component update
                io.emit('component-update', {
                    layerId: 'infrastructure',
                    componentId: 'dbaccess',
                    status: 'active',
                    timestamp: now
                });
            }
        }
        
        dbStates.set(dbId, db);
        logger.info(`Database ${dbId} status updated to ${status}${operation ? ` - ${operation}` : ''}`);
        
        // Broadcast the update to all connected clients with enhanced details
        io.emit('db-update', { 
            dbId, 
            status,
            operation,
            operationCount: db.operationCount,
            timestamp: now,
            connectedLayers: db.connectedLayers
        });
    }
}

// Function to get current system state with enhanced details
function getSystemState() {
    return {
        layers: Array.from(layerStates.entries()).map(([id, state]) => ({
            id,
            name: id.charAt(0).toUpperCase() + id.slice(1) + ' Layer',
            status: state.status,
            lastActive: state.lastActive,
            components: Object.entries(state.components).map(([compId, compState]) => ({
                id: compId,
                status: compState.status,
                lastActive: compState.lastActive
            })),
            currentOperation: state.currentOperation
        })),
        databases: Array.from(dbStates.entries()).map(([id, state]) => ({
            id,
            name: id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            status: state.status,
            lastActive: state.lastActive,
            operationCount: state.operationCount,
            lastOperation: state.lastOperation,
            connectedLayers: state.connectedLayers
        })),
        stats: {
            totalRequests: stats.totalRequests,
            dbOperations: stats.dbOperations,
            averageResponseTime: stats.responseTimes.length > 0 
                ? Math.round(stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length) 
                : 0,
            activeRequests: activeRequests.size
        }
    };
}

// Function to start tracking a request
function startRequest(requestId = null, path = '/api/unknown') {
    const id = requestId || `req-${++requestCounter}`;
    
    activeRequests.set(id, {
        id,
        startTime: Date.now(),
        path,
        currentLayer: null,
        layers: []
    });
    
    stats.totalRequests++;
    
    logger.info(`Request ${id} started: ${path}`);
    
    return id;
}

// Function to update request flow
function updateRequestFlow(requestId, layerId) {
    if (activeRequests.has(requestId)) {
        const request = activeRequests.get(requestId);
        request.currentLayer = layerId;
        request.layers.push({
            layerId,
            timestamp: Date.now()
        });
        
        activeRequests.set(requestId, request);
        
        logger.info(`Request ${requestId} now in ${layerId} layer`);
    }
}

// Function to end request tracking
function endRequest(requestId) {
    if (activeRequests.has(requestId)) {
        const request = activeRequests.get(requestId);
        const endTime = Date.now();
        const duration = endTime - request.startTime;
        
        stats.responseTimes.push(duration);
        // Keep only last 20 response times
        if (stats.responseTimes.length > 20) {
            stats.responseTimes.shift();
        }
        
        logger.info(`Request ${requestId} completed in ${duration}ms`);
        
        // Send final update before removing
        io.emit('request-completed', {
            requestId,
            path: request.path,
            duration,
            layers: request.layers
        });
        
        activeRequests.delete(requestId);
    }
}

// WebSocket connection handling
io.on('connection', (socket) => {
    logger.info('New client connected', { socketId: socket.id });
    
    // Send initial system state to the new client
    socket.emit('system-state', getSystemState());
    
    socket.on('disconnect', () => {
        logger.info('Client disconnected', { socketId: socket.id });
    });
});

// API endpoint to receive layer activity
app.post('/api/layer-activity', express.json(), (req, res) => {
    const { layerId, status, component, operation, requestId } = req.body;
    logger.info('Received layer activity:', { layerId, status, component, operation, requestId, body: req.body });
    
    // If request ID is provided, update request flow
    let reqId = requestId;
    if (status === 'active') {
        if (!reqId) {
            reqId = startRequest(null, req.body.path || `/api/${layerId}`);
        }
        updateRequestFlow(reqId, layerId);
    } else if (reqId && layerId === 'infrastructure') {
        // End request tracking when infrastructure layer finishes
        endRequest(reqId);
    }
    
    updateLayerStatus(layerId, status, component, operation);
    io.emit('system-state', getSystemState());
    
    res.status(200).json({ 
        message: 'Layer activity received',
        requestId: reqId 
    });
});

// API endpoint to receive database activity
app.post('/api/db-activity', express.json(), (req, res) => {
    const { dbId, status, operation } = req.body;
    logger.info('Received database activity:', { dbId, status, operation, body: req.body });
    
    updateDbStatus(dbId, status, operation);
    io.emit('system-state', getSystemState());
    
    res.status(200).json({ message: 'Database activity received' });
});

// API endpoint to get current system state
app.get('/api/system-state', (req, res) => {
    logger.info('System state requested');
    res.json(getSystemState());
});

// Test endpoint to verify service is working
app.get('/api/test', (req, res) => {
    logger.info('Test endpoint hit');
    res.json({ 
        message: 'Visualization service is running',
        systemState: getSystemState()
    });
});

// Simulate request endpoint for testing
app.post('/api/simulate-request', express.json(), (req, res) => {
    logger.info('Simulating request flow');
    
    const reqId = startRequest(null, req.body.path || '/api/test');
    
    // Respond immediately so the client knows the simulation has started
    res.json({ 
        message: 'Simulating request flow', 
        requestId: reqId 
    });
    
    // Simulate flow through all layers
    const layerSequence = ['presentation', 'application', 'domain', 'infrastructure'];
    const componentsByLayer = {
        'presentation': ['controllers', 'routes', 'views'],
        'application': ['services', 'usecases', 'logic'],
        'domain': ['entities', 'valueobjects', 'domainservices'],
        'infrastructure': ['repositories', 'dbaccess', 'externalservices']
    };
    
    const operations = {
        'presentation': ['Processing HTTP request', 'Routing API call', 'Rendering view'],
        'application': ['Executing business logic', 'Processing use case', 'Validating request'],
        'domain': ['Updating entity state', 'Applying domain rules', 'Creating value object'],
        'infrastructure': ['Querying database', 'Accessing external API', 'Storing data']
    };
    
    // Use consistent step time for clearer visualization
    const stepTime = 5000; // 5 seconds per layer
    
    // Simulate layer activations sequentially with fixed delay between layers
    let delay = 0;
    layerSequence.forEach(layerId => {
        // Get random component for layer
        const components = componentsByLayer[layerId];
        const component = components[Math.floor(Math.random() * components.length)];
        
        // Get random operation
        const layerOps = operations[layerId];
        const operation = layerOps[Math.floor(Math.random() * layerOps.length)];
        
        // Activate layer
        setTimeout(() => {
            updateLayerStatus(layerId, 'active', component, operation);
            updateRequestFlow(reqId, layerId);
            
            // If infrastructure layer, also activate a random database
            if (layerId === 'infrastructure') {
                const dbIds = Array.from(dbStates.keys());
                const randomDb = dbIds[Math.floor(Math.random() * dbIds.length)];
                const dbOps = ['Reading data', 'Writing data', 'Updating record', 'Querying'];
                const dbOp = dbOps[Math.floor(Math.random() * dbOps.length)];
                
                updateDbStatus(randomDb, 'active', dbOp);
                
                // Deactivate DB with the layer
                setTimeout(() => {
                    updateDbStatus(randomDb, 'inactive');
                }, stepTime - 500);
            }
            
            // Deactivate layer 
            setTimeout(() => {
                updateLayerStatus(layerId, 'inactive');
                
                // End request when all layers complete
                if (layerId === 'infrastructure') {
                    // Wait a bit more to complete the request for better visualization
                    setTimeout(() => {
                        endRequest(reqId);
                    }, 1000);
                }
            }, stepTime - 500);
        }, delay);
        
        // Increment delay for next layer
        delay += stepTime;
    });
});

// Serve the main visualization page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.LAYERED_VISUALIZATION_PORT || 3006;
server.listen(PORT, () => {
    logger.info(`Visualization service running on port ${PORT}`);
    logger.info(`Test endpoint available at http://localhost:${PORT}/api/test`);
    logger.info(`Simulation endpoint available at http://localhost:${PORT}/api/simulate-request`);
}); 