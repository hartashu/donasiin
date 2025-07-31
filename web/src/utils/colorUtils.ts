const colorPairs = [
    { text: '#1E40AF', bg: '#DBEAFE' }, // Blue
    { text: '#991B1B', bg: '#FEE2E2' }, // Red
    { text: '#166534', bg: '#DCFCE7' }, // Green
    { text: '#92400E', bg: '#FEF3C7' }, // Amber
    { text: '#701A75', bg: '#F3E8FF' }, // Purple
    { text: '#9A3412', bg: '#FFEDD5' }, // Orange
    { text: '#065F46', bg: '#D1FAE5' }, // Emerald
];

export const getCategoryColor = (categoryName: string) => {
    if (!categoryName) return colorPairs[0];
    const charCodeSum = categoryName
        .split("")
        .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const index = charCodeSum % colorPairs.length;
    return colorPairs[index];
};