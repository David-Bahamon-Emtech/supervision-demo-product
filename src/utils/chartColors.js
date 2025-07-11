export const getChartColors = () => {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  
  return {
    colors: [
      computedStyle.getPropertyValue('--chart-color-1').trim(),
      computedStyle.getPropertyValue('--chart-color-2').trim(),
      computedStyle.getPropertyValue('--chart-color-3').trim(),
      computedStyle.getPropertyValue('--chart-color-4').trim(),
      computedStyle.getPropertyValue('--chart-color-5').trim(),
      computedStyle.getPropertyValue('--chart-color-6').trim(),
      computedStyle.getPropertyValue('--chart-color-7').trim(),
    ],
    gridColor: computedStyle.getPropertyValue('--chart-grid-color').trim(),
    textColor: computedStyle.getPropertyValue('--chart-text-color').trim(),
    titleColor: computedStyle.getPropertyValue('--chart-title-color').trim(),
  };
};

export const getChartOptions = (title) => {
  const colors = getChartColors();
  
  return {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: colors.textColor,
        },
      },
      title: {
        display: true,
        text: title,
        color: colors.titleColor,
      },
    },
    scales: {
      y: {
        ticks: { color: colors.textColor },
        grid: { color: colors.gridColor },
      },
      x: {
        ticks: { color: colors.textColor },
        grid: { color: colors.gridColor },
      },
    },
  };
};