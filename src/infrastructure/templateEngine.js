const path = require('path');
const fs = require('fs').promises;
const ejs = require('ejs');

class TemplateEngine {
    static async render(res, templateName, data) {
        try {
            const templatePath = path.join(__dirname, '../../views', `${templateName}.ejs`);
            const template = await fs.readFile(templatePath, 'utf-8');
            const html = ejs.render(template, data);
            
            res.setHeader('Content-Type', 'text/html');
            res.send(html);
        } catch (error) {
            console.error('Error rendering template:', error);
            throw error;
        }
    }
}

module.exports = {
    render: TemplateEngine.render
}; 