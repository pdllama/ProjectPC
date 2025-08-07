import {Typography} from '@mui/material'

export default function ParagraphList({paragraphs=[], textColor, sx, indent=false}) {

    return (
        <>
            {paragraphs.map((p) => {
                const indentStyle = indent ? {textIndent: '30px'} : {}
                const textColorStyle = textColor ? {color: textColor} : {}
                return (
                    <Typography sx={{...indentStyle, ...textColorStyle, ...sx}}>
                        {p}
                    </Typography>
                )
            })}
        </>
    )
}