# Blockquotes — Mixed Content

## Single level

> A simple quote with no nesting.

## Two levels

> First level begins.
>
> > Second level inside.
> > Still second level.

## Three levels

> Level one.
>
> > Level two.
> >
> > > Level three, deepest.

## Quote containing a list

> Steps to reproduce:
>
> 1. Open the editor.
> 2. Paste the sample.
>    - Confirm bold renders
>    - Confirm italic renders
> 3. Check the console.
>
> End of quote.

## Quote containing a fenced code block

> Example configuration:
>
> ```yaml
> theme: dark
> font_size: 16
> autosave: false
> ```
>
> Apply and reload.

## Quote containing a heading

> ## Warning
>
> This section is quoted material, not regular content.

## Quote with multi-paragraph content

> First paragraph of the quote.
>
> Second paragraph, still quoted.
>
> Third paragraph to close.

## Nested quote containing another quote's list

> Outer quote:
>
> > Inner quote with list:
> >
> > - one
> > - two
> >   - two-a
> >   - two-b
>
> Back to outer.

## Quote with attribution

> The best way to predict the future is to invent it.
>
> — Alan Kay
