# Individual page

- Each page's content is in `article` tag
- Pages with problem + solution has 2 immediate children inside `article` tag.
  - First child is the problem
  - Second child is the solution
- The solution element has a `deriveit-18zgjb5` class
- The solution element can be found in concept pages as well
- The general idea is to extract and store the html stored inside `article` tag. Then use that directly inside React Native to render the page.
  However, there are many tags inside `article` tag that are unnecessary. So, we need to remove them.\
  The idea is to also remove all inline styles and `style` tags inside `article` tag since styling will be entirely handled in React Native.\
- There are different types of elements in the content - normal text, images, code blocks, math formulas (to explain in pseudo code), etc.
- While the normal text and the images can be extracted as is, the math formulas and code blocks need to be tagged properly when extracting the content.\
  Math formulas and code blocks cannot be rendered as is in React Native and the HTML renderer library in RN can't handle these element type's markup.\
  Meaning they have to be handled by their separate respective libraries or custom components.
