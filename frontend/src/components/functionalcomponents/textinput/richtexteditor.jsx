import {Box, Typography, useTheme} from '@mui/material'
import {Editor} from 'primereact/editor'
import Quill, { Delta } from 'quill'
import MyBlock from './classes/myblock'
import { customColorAttributor, customFontFamilyAttributor, customSizeAttributor, CustomListItem } from './classes/CustomListBlot'
import hexToRgba from 'hex-to-rgba'

const fontSize = ['8px','9px','10px','12px','13px','14px','15px','16px','20px','24px','32px', '36px','42px','54px', '66px','72px','84px','96px']
const Size = Quill.import('attributors/style/size');
Size.whitelist = fontSize;
Quill.debug(false)
Quill.register(Size, true)
Quill.register('blots/block', MyBlock, true)
Quill.register(customColorAttributor, true)
Quill.register(customFontFamilyAttributor, true)
Quill.register(customSizeAttributor, true)
Quill.register('formats/list-item', CustomListItem, true)

export default function RichTextEditor({value, onChange, sx, isAdminEditor=false}) {
    const theme = useTheme()

    const renderHeader = () => (
            <div id="toolbar-container">
                <span className="ql-formats">
                    <select title="Size" className="ql-size">
                        {fontSize.map((fS) => {
                            const label = isAdminEditor ? (fS === '36px' ? '36px (HEADER)' : fS === '15px' ? '15px (PARA)' : fS === '14px' ? '14px (PARA 2)' : fS === '13px' ? '13px (PARA 3)' : fS) : fS
                            return <option key={`${fS}-option`} value={fS}>{label}</option>
                        })}
                    </select>
                </span>
                <span className="ql-formats">
                    <button className="ql-bold"></button>
                    <button className="ql-italic"></button>
                    <button className="ql-underline"></button>
                    <button className="ql-strike"></button>
                </span>
                <span className="ql-formats">
                    <select className="ql-color"></select>
                    <select className="ql-background"></select>
                </span>
                <span className="ql-formats">
                    <button className="ql-script" value="sub"></button>
                    <button className="ql-script" value="super"></button>
                </span>
                {/* <span className="ql-formats">
                    <button className="ql-header" value="1"></button>
                    <button className="ql-header" value="2"></button>
                    <button className="ql-blockquote"></button>
                    <button className="ql-code-block"></button>
                </span> */}
                <span className="ql-formats">
                    <button className="ql-list" value="ordered"></button>
                    <button className="ql-list" value="bullet"></button>
                    <button className="ql-indent" value="-1"></button>
                    <button className="ql-indent" value="+1"></button>
                </span>
            </div>
        )

    return (
        <Editor 
            value={value}
            onLoad={(quill) => {
                quill.keyboard.bindings.Tab[5].handler = (range, context) => {
                    context.line.addIndent()
                }
                
                const currFunc = quill.keyboard.bindings.Backspace[2].handler
                quill.keyboard.bindings.Backspace[2].handler = (range, context) => {
                    if (context.offset === 0 && context.line.domNode.getAttribute('style').includes('text-indent: 30px;')) {
                        context.line.removeIndent()
                        return
                    }
                    currFunc.call({quill}, range, context) //.call lets you set a custom "this" value. "this" is the first param. this is needed for how the default works
                }
                const currEnterFunc = quill.keyboard.bindings.Enter[6].handler
                quill.keyboard.bindings.Enter[6].handler = (range, context) => {
                    
                    this.quill.formatLine(range.index, 1, context.format)
                    // note: ^ the "this" quantifier above technically throws an error since "this" is undefined.
                    // however, the code works as expected for whatever reason.
                    // for now we'll keep it, but please fix it if you use a rich text editor for users to use.
                    currEnterFunc.call({quill}, range, context)
                    // quill.updateContents(new Delta().retain(range.index+1, {attributes: context.format}))
                    // quill.formatLine(range.index, 1, context.format)
                }
                // quill.on('text-change', (delta, oldDelta, source) => {
                //     if (delta.ops[1] !== undefined && delta.ops[1].insert === '\n') {
                //         if (oldDelta.ops[0] !== undefined && oldDelta.ops[0].attributes !== undefined) {
                //             console.log(delta)
                //             console.log(oldDelta) 
                //             const specificCharNum = delta.ops[0].retain+1
                //             const prevFormat = quill.getFormat(specificCharNum-1)
                //             this.quill.formatLine(specificCharNum, 1, prevFormat)
                //            
                //         }
                //     }
                // })
            }}
            headerTemplate={renderHeader()}
            style={{height: '500px', width: '100%', maxWidth: '800px', ...sx}}
            onTextChange={onChange}
        />
    )
}