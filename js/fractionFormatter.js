// Fraction Formatter - Converts text fractions to visual format
// Handles: 3/4, 2 3/4, etc.

class FractionFormatter {
    constructor() {
        // Patterns to detect fractions
        this.patterns = {
            // Mixed number: 2 3/4
            mixedNumber: /(\d+)\s+(\d+)\/(\d+)/g,
            // Simple fraction: 3/4
            simpleFraction: /(\d+)\/(\d+)/g
        };
    }

    // Main formatting function
    format(text) {
        if (!text) return text;
        
        let formatted = text.toString();
        
        // First, handle mixed numbers (must be done before simple fractions)
        formatted = this.formatMixedNumbers(formatted);
        
        // Then handle remaining simple fractions
        formatted = this.formatSimpleFractions(formatted);
        
        return formatted;
    }

    // Format mixed numbers: 2 3/4 → 2<sup>3</sup>/<sub>4</sub>
    formatMixedNumbers(text) {
        return text.replace(this.patterns.mixedNumber, (match, whole, numerator, denominator) => {
            return `${whole}<span class="fraction"><sup>${numerator}</sup>&frasl;<sub>${denominator}</sub></span>`;
        });
    }

    // Format simple fractions: 3/4 → <sup>3</sup>/<sub>4</sub>
    formatSimpleFractions(text) {
        return text.replace(this.patterns.simpleFraction, (match, numerator, denominator) => {
            return `<span class="fraction"><sup>${numerator}</sup>&frasl;<sub>${denominator}</sub></span>`;
        });
    }

    // Alternative: Use stacked fraction format
    formatStacked(text) {
        if (!text) return text;
        
        let formatted = text.toString();
        
        // Mixed numbers
        formatted = formatted.replace(this.patterns.mixedNumber, (match, whole, numerator, denominator) => {
            return `${whole}<span class="fraction-stacked"><span class="frac-top">${numerator}</span><span class="frac-line"></span><span class="frac-bottom">${denominator}</span></span>`;
        });
        
        // Simple fractions
        formatted = formatted.replace(this.patterns.simpleFraction, (match, numerator, denominator) => {
            return `<span class="fraction-stacked"><span class="frac-top">${numerator}</span><span class="frac-line"></span><span class="frac-bottom">${denominator}</span></span>`;
        });
        
        return formatted;
    }
}

// Create global instance
const fractionFormatter = new FractionFormatter();

// Helper function to format text elements
function formatFractionsInElement(element) {
    if (!element) return;
    
    // Get all text nodes
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    const textNodes = [];
    let node;
    
    while (node = walker.nextNode()) {
        // Skip script and style elements
        if (node.parentElement.tagName !== 'SCRIPT' && 
            node.parentElement.tagName !== 'STYLE') {
            textNodes.push(node);
        }
    }
    
    // Replace text with formatted fractions
    textNodes.forEach(textNode => {
        const originalText = textNode.textContent;
        const formattedText = fractionFormatter.format(originalText);
        
        if (formattedText !== originalText) {
            const span = document.createElement('span');
            span.innerHTML = formattedText;
            textNode.parentNode.replaceChild(span, textNode);
        }
    });
}