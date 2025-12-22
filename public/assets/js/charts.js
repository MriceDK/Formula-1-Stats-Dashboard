const chartsCache =
    {
        positionsChart : null,
        pointsPerSeasonChart : null,
        retirementsChart : null
    };

const F1Colors = [
    "#ED1131",  // Ferrari Red [web:2]
    "#00D7B6",  // Mercedes Teal [web:2]
    "#4781D7",  // Red Bull Blue [web:2]
    "#1868DB",  // Williams Blue [web:2]
    "#00A1E8",  // Alpine Blue [web:2]
    "#FF8700",  // McLaren Orange [web:10]
    "#ea7000",  // F1 Orange
    "#20936b",  // Racing Green
    "#95989b",  // Neutral Gray
    "#e10600"   // F1 Official Red [web:3]
];

function piechart(data, ctx, retirement = false) {

    const canvasId = ctx.canvas.id;

    // Destroy existing charts
    if (chartsCache.positionsChart && canvasId === 'driver-positions-chart') {
        chartsCache.positionsChart.destroy();
    }
    if (chartsCache.retirementsChart && canvasId === 'driver-retirement-chart') {
        chartsCache.retirementsChart.destroy();
    }

    const configuration = {
        type: 'pie',
        data: {
            labels: Object.keys(data),
            datasets: [{
                data: Object.values(data),
                backgroundColor: F1Colors,
                borderColor: '#ffffff20',
                borderWidth: 3,
                borderAlign: 'inner',
                hoverBorderWidth: 4,
                hoverBorderColor: '#ffffff40',
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: retirement ? "Retirements by Reason" : "Distribution of Positions",
                    font: {
                        family: "'formula-1-bold', sans-serif",
                        size: 18,
                        weight: 'bold'
                    },
                    color: 'white',
                    padding: {
                        top: 40,
                        bottom: 40
                    }
                },
                legend: {
                    display: false,
                },
                datalabels: {
                    color: 'white',
                    font: {
                        weight: 'bold',
                        size: 14
                    },
                    formatter: (value, context) => {
                        return context.chart.data.labels[context.dataIndex];
                    },
                    anchor: 'end',
                    align: 'end',
                    offset: 8
                },
                tooltip: {
                    backgroundColor: 'rgba(21, 21, 30, 0.95)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: 'rgba(225, 6, 0, 0.5)',
                    borderWidth: 1,
                    cornerRadius: 12,
                    displayColors: true,
                    padding: 15
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1500,
                easing: 'easeOutQuart'
            }
        }
    };

    if (canvasId === 'driver-positions-chart') {
        chartsCache.positionsChart = new Chart(ctx, configuration);
    } else if (canvasId === 'driver-retirement-chart') {
        chartsCache.retirementsChart = new Chart(ctx, configuration);
    }
}

function barChart(data, ctx) {
    const canvasId = ctx.canvas.id;
    if (chartsCache.pointsPerSeasonChart && canvasId === 'points-per-season-chart') {
        chartsCache.pointsPerSeasonChart.destroy();
    }

    const configuration = {
        type: 'bar',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: "Points",
                data: Object.values(data),
                backgroundColor: F1Colors[0], // F1 Red gradient base
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 2,
                borderRadius: 12,
                borderSkipped: false,
                barThickness: 'flex',
                maxBarThickness: 60
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: "Points per Season",
                    font: {
                        family: "'formula-1-bold', sans-serif",
                        size: 20,
                        weight: 'bold'
                    },
                    color: 'white',
                    padding: {
                        top: 20,
                        bottom: 25
                    }
                },
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(21, 21, 30, 0.95)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: 'rgba(225, 6, 0, 0.5)',
                    borderWidth: 1,
                    cornerRadius: 12,
                    padding: 15
                },
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            family: "'formula-1', sans-serif",
                            size: 12
                        },
                        maxRotation: 45,
                        minRotation: 0
                    },
                    title: {
                        display: true,
                        text: "Season",
                        color: 'white',
                        font: {
                            family: "'formula-1-bold', sans-serif",
                            size: 15,
                            weight: 'bold'
                        },
                        padding: {
                            bottom: 15
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        lineWidth: 1
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            family: "'formula-1', sans-serif",
                            size: 12
                        },
                        callback: function(value) {
                            return value + ' pts';
                        }
                    },
                    title: {
                        display: true,
                        text: "Points",
                        color: 'white',
                        font: {
                            family: "'formula-1-bold', sans-serif",
                            size: 15,
                            weight: 'bold'
                        },
                        padding: {
                            top: 15
                        }
                    },
                    beginAtZero: true
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeOutQuart',
                delay: 500
            }
        }
    };

    chartsCache.pointsPerSeasonChart = new Chart(ctx, configuration);
}

export { piechart, barChart };