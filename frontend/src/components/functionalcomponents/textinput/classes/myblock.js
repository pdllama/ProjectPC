import Quill from 'quill'

const Block = Quill.import('blots/block')
class MyBlock extends Block {
    static create() {
        const node = super.create()
        node.setAttribute('style', 'margin: 0; margin-top: 0.5em; margin-bottom: 0.5em;')
        return node
    }

    addIndent() {
        const currentStyleAtts = this.domNode.getAttribute('style')
        if (!currentStyleAtts.includes('text-indent: 30px;')) {
            this.domNode.setAttribute('style', `${this.domNode.getAttribute('style')} text-indent: 30px;`)
        }
    }

    removeIndent() {
        this.domNode.setAttribute('style', `${this.domNode.getAttribute('style').replace('text-indent: 30px;', '')}`)
    }
}

export default MyBlock