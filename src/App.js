import React from 'react';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.useTheme(am4themes_animated);

class App extends React.Component {

  componentDidMount() {

    let chart = am4core.create("chartdiv", am4charts.XYChart);

// Add data
chart.dataSource.url = "https://poloniex.com/public?command=returnOrderBook&currencyPair=USDT_BTC&depth=50";
chart.dataSource.reloadFrequency = 30000;
chart.dataSource.adapter.add("parsedData", function(data) {
  
  // Function to process (sort and calculate cummulative volume)
  function processData(list, type, desc) {

    // Convert to data points
    for(var i = 0; i < list.length; i++) {
      list[i] = {
        value: Number(list[i][0]),
        volume: Number(list[i][1]),
      }
    }

    // Sort list just in case
    list.sort(function(a, b) {
      if (a.value > b.value) {
        return 1;
      }
      else if (a.value < b.value) {
        return -1;
      }
      else {
        return 0;
      }
    });

    // Calculate cummulative volume
    if (desc) {
      for(var i = list.length - 1; i >= 0; i--) {
        if (i < (list.length - 1)) {
          list[i].totalvolume = list[i+1].totalvolume + list[i].volume;
        }
        else {
          list[i].totalvolume = list[i].volume;
        }
        let dp = {};
        dp["value"] = list[i].value;
        dp[type + "volume"] = list[i].volume;
        dp[type + "totalvolume"] = list[i].totalvolume;
        res.unshift(dp);
      }
    }
    else {
      for(var i = 0; i < list.length; i++) {
        if (i > 0) {
          list[i].totalvolume = list[i-1].totalvolume + list[i].volume;
        }
        else {
          list[i].totalvolume = list[i].volume;
        }
        let dp = {};
        dp["value"] = list[i].value;
        dp[type + "volume"] = list[i].volume;
        dp[type + "totalvolume"] = list[i].totalvolume;
        res.push(dp);
      }
    }

  }

  // Init
  let res = [];
  processData(data.bids, "bids", true);
  processData(data.asks, "asks", false);

  return res;
});

// Set up precision for numbers
chart.numberFormatter.numberFormat = "#,###.####";

// Create axes
let xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
xAxis.dataFields.category = "value";
//xAxis.renderer.grid.template.location = 0;
xAxis.renderer.minGridDistance = 50;
xAxis.title.text = "Price (BTC/ETH)";

let yAxis = chart.yAxes.push(new am4charts.ValueAxis());
yAxis.title.text = "Volume";

// Create series
let series = chart.series.push(new am4charts.StepLineSeries());
series.dataFields.categoryX = "value";
series.dataFields.valueY = "bidstotalvolume";
series.strokeWidth = 2;
series.stroke = am4core.color("#0f0");
series.fill = series.stroke;
series.fillOpacity = 0.1;
series.tooltipText = "Ask: [bold]{categoryX}[/]\nTotal volume: [bold]{valueY}[/]\nVolume: [bold]{bidsvolume}[/]"

let series2 = chart.series.push(new am4charts.StepLineSeries());
series2.dataFields.categoryX = "value";
series2.dataFields.valueY = "askstotalvolume";
series2.strokeWidth = 2;
series2.stroke = am4core.color("#f00");
series2.fill = series2.stroke;
series2.fillOpacity = 0.1;
series2.tooltipText = "Ask: [bold]{categoryX}[/]\nTotal volume: [bold]{valueY}[/]\nVolume: [bold]{asksvolume}[/]"


// Add cursor
chart.cursor = new am4charts.XYCursor();

    this.chart = chart;
  }

  componentWillUnmount() {
    if (this.chart) {
      this.chart.dispose();
    }
  }

  render(){
    return(
      <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>
    );
  }
}

export default App;
