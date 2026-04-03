// Enhanced Fraction Formatter - Converts text fractions to visual format
// Handles: 3/4, 2 3/4, 2x/5, (2x-5)/4, etc.

class FractionFormatter {
    constructor() {
        // Patterns to detect fractions (order matters - most specific first)
        this.patterns = {
            // Mixed number: 2 3/4 (must be detected first)
            mixedNumber: /(\d+)\s+(\d+)\/(\d+)/g,
            
            // Parentheses fractions: (2x-5)/4, (a+b)/(c-d), x/(y+2)
            // Matches: (anything)/anything, anything/(anything), (anything)/(anything)
            parenFraction: /\(([^)]+)\)\/\(([^)]+)\)|\(([^)]+)\)\/([a-zA-Z0-9]+)|([a-zA-Z0-9]+)\/\(([^)]+)\)/g,
            
            // Algebraic simple: 2x/5, x/2, 3y/7, xy/12
            // Matches: (digits+letters) / digits  OR  digits / (digits+letters)
            algebraicSimple: /(\d*[a-zA-Z][a-zA-Z0-9]*)\/(\d+)|(\d+)\/(\d*[a-zA-Z][a-zA-Z0-9]*)/g,
            
            // Simple numeric fraction: 3/4 (fallback - least specific)
            simpleFraction: /(\d+)\/(\d+)/g
        };
    }

    // Main formatting function - uses diagonal fractions (sup/sub)
    format(text) {
        if (!text) return text;
        let formatted = text.toString();
        
        // Process in order of specificity (most specific first)
        formatted = this.formatMixedNumbers(formatted, 'diagonal');
        formatted = this.formatParenthesisFractions(formatted, 'diagonal');
        formatted = this.formatAlgebraicSimple(formatted, 'diagonal');
        formatted = this.formatSimpleFractions(formatted, 'diagonal');
        
        return formatted;
    }

    // Alternative: Use stacked fraction format (horizontal bar)
    formatStacked(text) {
        if (!text) return text;
        let formatted = text.toString();
        
        // Process in order of specificity
        formatted = this.formatMixedNumbers(formatted, 'stacked');
        formatted = this.formatParenthesisFractions(formatted, 'stacked');
        formatted = this.formatAlgebraicSimple(formatted, 'stacked');
        formatted = this.formatSimpleFractions(formatted, 'stacked');
        
        return formatted;
    }

    // Format mixed numbers: 2 3/4 → 2 [3 over 4]
    formatMixedNumbers(text, style = 'diagonal') {
        return text.replace(this.patterns.mixedNumber, (match, whole, numerator, denominator) => {
            if (style === 'stacked') {
                return `${whole}<span class="fraction-stacked"><span class="frac-top">${numerator}</span><span class="frac-line"></span><span class="frac-bottom">${denominator}</span></span>`;
            } else {
                return `${whole}<span class="fraction"><sup>${numerator}</sup>&frasl;<sub>${denominator}</sub></span>`;
            }
        });
    }

    // Format fractions with parentheses: (2x-5)/4, (a+b)/(c-d), x/(y+2)
    formatParenthesisFractions(text, style = 'diagonal') {
        return text.replace(this.patterns.parenFraction, (match, ...groups) => {
            let numerator, denominator;
            
            // Determine which capture groups were matched
            if (groups[0] && groups[1]) {
                // (a)/(b) - both have parentheses
                numerator = groups[0];
                denominator = groups[1];
            } else if (groups[2] && groups[3]) {
                // (a)/b - only numerator has parentheses
                numerator = groups[2];
                denominator = groups[3];
            } else if (groups[4] && groups[5]) {
                // a/(b) - only denominator has parentheses
                numerator = groups[4];
                denominator = groups[5];
            } else {
                return match; // No valid match, return original
            }
            
            if (style === 'stacked') {
                return `<span class="fraction-stacked"><span class="frac-top">${numerator}</span><span class="frac-line"></span><span class="frac-bottom">${denominator}</span></span>`;
            } else {
                return `<span class="fraction"><sup>${numerator}</sup>&frasl;<sub>${denominator}</sub></span>`;
            }
        });
    }

    // Format simple algebraic fractions: 2x/5, x/2, 3y/7
    formatAlgebraicSimple(text, style = 'diagonal') {
        return text.replace(this.patterns.algebraicSimple, (match, num1, denom1, num2, denom2) => {
            const numerator = num1 || num2;
            const denominator = denom1 || denom2;
            
            if (style === 'stacked') {
                return `<span class="fraction-stacked"><span class="frac-top">${numerator}</span><span class="frac-line"></span><span class="frac-bottom">${denominator}</span></span>`;
            } else {
                return `<span class="fraction"><sup>${numerator}</sup>&frasl;<sub>${denominator}</sub></span>`;
            }
        });
    }

    // Format simple numeric fractions: 3/4
    formatSimpleFractions(text, style = 'diagonal') {
        return text.replace(this.patterns.simpleFraction, (match, numerator, denominator) => {
            if (style === 'stacked') {
                return `<span class="fraction-stacked"><span class="frac-top">${numerator}</span><span class="frac-line"></span><span class="frac-bottom">${denominator}</span></span>`;
            } else {
                return `<span class="fraction"><sup>${numerator}</sup>&frasl;<sub>${denominator}</sub></span>`;
            }
        });
    }

    // Debug/Test helper - logs what patterns would match
    testPattern(text) {
        console.log('Testing:', text);
        console.log('Mixed Number:', this.patterns.mixedNumber.test(text));
        console.log('Paren Fraction:', this.patterns.parenFraction.test(text));
        console.log('Algebraic Simple:', this.patterns.algebraicSimple.test(text));
        console.log('Simple Fraction:', this.patterns.simpleFraction.test(text));
    }
}

// Helper function to format text elements in the DOM
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

// Create global instance
const fractionFormatter = new FractionFormatter();

// Console test function (for debugging)
function testFractionFormatter() {
    console.log('=== FRACTION FORMATTER TESTS ===\n');
    
    const tests = [
        '3/4',
        '2 3/4',
        '2x/5',
        'x/2',
        '(2x-5)/4',
        '2(2x-5)/4',
        '(a+b)/(c-d)',
        'x/(y+2)',
        'Solve: 2x/5 = 10',
        'What is 2 3/4 + 1/2?',
        'Simplify (2x-5)/4 + 3/8'
    ];
    
    tests.forEach(test => {
        const diagonal = fractionFormatter.format(test);
        const stacked = fractionFormatter.formatStacked(test);
        console.log(`Input:    "${test}"`);
        console.log(`Diagonal: ${diagonal}`);
        console.log(`Stacked:  ${stacked}`);
        console.log(`Changed:  ${diagonal !== test ? '✓' : '✗'}`);
        console.log('---');
    });
}

// Uncomment to run tests on page load (for debugging):
// window.addEventListener('DOMContentLoaded', testFractionFormatter);