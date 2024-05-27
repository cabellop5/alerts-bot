import {ChartJSNodeCanvas} from 'chartjs-node-canvas';

const width = 1024;
const height = 768;
const backgroundColour = 'black';
const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width,
    height,
    backgroundColour
})

export const getImage = async (labels: Array<string>, datasets: Array<Record<string, any>>, title: string, subtitle: string) => {
    const maxMins = []
    for (const dataset of datasets) {
        maxMins.push(dataset.max)
        maxMins.push(dataset.min)
    }

    const max = Math.max(...maxMins)
    const min = Math.min(...maxMins)
    const factor = (max + min) / 3

    const scaleMax = factor + max
    const scaleMin = min - factor

    const configuration = {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets,
        },
        options: {
            elements: {
                point:{
                    radius: 0
                }
            },
            layout: {
                padding: {
                    right: 10,
                    top: 10,
                    bottom: 10,
                    left: 10,
                },
            },
            tooltips: false,
            scales: {
                y: {
                    grid: {
                        color: 'white'
                    },
                    ticks: {
                        font: {
                            size: 18,
                            color: 'white'
                        },
                        maxRotation: 0,
                        minRotation: 0,
                        callback: function(value) {
                            return value.toFixed(2) + ' %';
                        }
                    },
                    suggestedMin: scaleMin,
                    suggestedMax: scaleMax,
                },
                x: {
                    grid: {
                        display: false,
                        color: 'white'
                    },
                    ticks: {
                        font: {
                            size: 18,
                            color: 'white'
                        },
                        maxRotation: 0,
                        minRotation: 0,
                    }
                },
            },
            plugins: {
                layout: {
                    padding: 20,
                },
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 30,
                        boxHeight: 0,
                    }
                },
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: 30,
                    },
                    padding: {
                        top: 10,
                        bottom: 10
                    }
                },
                subtitle: {
                    display: true,
                    text: subtitle,
                    font: {
                        size: 16,
                    },
                    padding: {
                        top: 10,
                        bottom: 10
                    }
                },
            },
        },
    }

    return chartJSNodeCanvas.renderToBuffer(configuration as any);
}