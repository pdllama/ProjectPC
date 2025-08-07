const titleWrapperMq = {'@media only screen and (max-width: 500px)': {
    alignItems: 'center'
}}
const prettyWrapperMq = {'@media only screen and (max-width: 500px)': {
    width: '100%'
}}
const primaryIndentation = {
    textIndent: '30px',
    '@media only screen and (max-width: 400px)': {
        textIndent: '10px'
    }
}
const secondaryIndentation = {
    ml: '40px',
    '@media only screen and (max-width: 400px)': {
        ml: '20px'
    }
}
const tertiaryIndentation = {
    ml: '60px',
    '@media only screen and (max-width: 400px)': {
        ml: '30px'
    }
}

const paraFontSizeMq = {
    '@media only screen and (max-width: 500px)': {
        fontSize: '12px'
    }
}

export {titleWrapperMq, prettyWrapperMq, primaryIndentation, secondaryIndentation, tertiaryIndentation, paraFontSizeMq}
