export default function getSubMenuButtons(screen) {
    return screen === 'changeScope' ? [
        {screen: 'pokemonScope', display: 'Pokemon Scope'}, 
        {screen: 'ballScope', display: 'Ball Scope'}, 
        {screen: 'excludedCombos', display: 'Excluded Ball Combos'}
    ] : 
    screen === 'sorting' ? [
        {screen: 'collectionSort', display: 'Collection Sorting Settings'}, 
        {screen: 'onhandSort', display: 'On-Hand Sorting Settings'}, 
        {screen: 'customSort', display: 'Custom Sort Collection'}
    ] : 
    screen === 'tradePreferences' && [
        {screen: 'preferences', display: 'Preferences'}, 
        {screen: 'rates', display: 'Rates'}, 
        {screen: 'items', display: 'Items'}
    ]
}