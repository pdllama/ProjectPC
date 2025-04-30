import Quill from 'quill'

const Parchment = Quill.import('parchment')

const customFontFamilyAttributor = new Parchment.StyleAttributor('custom-family-attributor', 'font-family')
const customSizeAttributor = new Parchment.StyleAttributor('custom-size-attributor', 'font-size')
const customColorAttributor = new Parchment.StyleAttributor('custom-color-attributor', 'color')

const ListItemBlot = Quill.import('formats/list')

class CustomListItem extends ListItemBlot {
  optimize(context) {
    super.optimize(context)

    if (this.children.length >= 1) {
      const child = this.children.head
      const attributes = child?.attributes?.attributes

      if (attributes) {
        for (const key in attributes) {
          const element = attributes[key]
          let name = element.keyName
          const value = element.value(child.domNode)

          if (name === 'color') super.format('custom-color-attributor', value)
          else if (name === 'font-family') super.format('custom-family-attributor', value)
          else if (name === 'font-size') super.format('custom-size-attributor', value)
        }
      }
    }
  }
}

export {customColorAttributor, customFontFamilyAttributor, customSizeAttributor, CustomListItem}

