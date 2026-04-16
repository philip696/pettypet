const fs = require('fs');
const path = require('path');

const targetColors = 'slate|gray|zinc|neutral|stone|orange|amber|yellow|lime|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'.split('|');

function replaceClass(fullMatch, prefix1, prefix2, property, color, shade) {
  // prefix1 can be 'hover:', 'focus:', etc.
  // property can be 'bg', 'text', 'border', 'border-t', 'ring', 'from', 'to', 'via'
  
  if (color === 'red' || color === 'green') {
    return fullMatch; // Leave green and red alone as requested
  }
  if (!targetColors.includes(color)) {
    return fullMatch; // it could be 'white', 'black', 'transparent', or custom vars
  }

  const num = parseInt(shade, 10);
  const isText = property === 'text';
  const isBgOrFrom = property === 'bg' || property === 'from' || property === 'to' || property === 'via';
  const isBorderOrRing = property.includes('border') || property.includes('ring');

  let newColor = '';
  
  if (isText) {
    if (num <= 400) newColor = 'text-secondary';
    else if (num === 500) newColor = 'primary';
    else if (n    else if (n    else if (n    else if (n    else if (n    else if (n    else if (n    else if (n    else if (n    else if (n    else if (n    else if (n40'    else if (n    else if (n    else if (n    else if (n    else if (n    0)     else if (n    else if (n    else if (n ac    else if (n    else if (n    else if (n    else if (n    else if (n    elscolor';
    else if (num <= 500) newColor = 'primary';
                                                             newColor                                    x1 |                                                             newColor            {
    nst    nst    nst    nst    nst    for    nst    nst    nst    nst    nst ul    nst    nst    nst    nst    nst    for    nst    nst    nst    nst  )) {
      if (file !== 'node_modu      if (file !== 'node_modu      if (file !== 'node_modu      if (file !== 'nod;
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css') || file.endsWith('.js')) {
      if (fullPat      if (fullPat      if (fullPat      if (fullPat      if (fullPat      if (fullPat      if (fullPat      if (fullPat      if (fullPat      if (fullPat      if (fullPat      if (fullPat      if (fullPat      if (fullPat      if (fullPat      if (fullPat      if (fullPat      if (fullPat      if (fullPat      if (fullPat      if (fullPat      if (fullPat      if (fullPat  l)      if (fullPat      if (fullPat      if, but simplify and include with state) => just catch '([a-z-:]*:)?'
      // property: 'bg', 'text', 'border', 'border-[trbl]', 'ring', 'from', 'to', 'via'
      // color: ([a-z]+)
      // shade:       // shade:       // shade:       // shade:       // shade:       // shade:       // shade:       // shade:       // shade:       // shade:  wContent = n      // shade:       // shade:       // shade:       // shade:       // shade:       // shade:       // sp1, p2      ,       // shade:       // shade:       // shade:       // shade:       // shade:       // shade:       // shade:al' (already converted, skip)

      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log('Updated', fullPath);
      }
    }
  }
}

processDirectory(process.cwd());
