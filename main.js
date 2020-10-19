am4core.useTheme(am4themes_animated);

var chart = am4core.create("chartdiv", am4maps.MapChart);
chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

chart.geodata = am4geodata_worldUltra;
chart.projection = new am4maps.projections.Miller();
chart.geodataNames = am4geodata_lang_DE;

let colorSet =
    [
        "#009900",
        "#CC0000",
        "#FF9900",
        "#9999FF"
    ];

let legend = chart.createChild(am4maps.Legend);
legend.data = [
    {
        "name": "Kein Risikogebiet",
        "fill": colorSet[0]
    },
    {
        "name": "Regionale Risikogebiete",
        "fill": colorSet[2]
    },
    {
        "name": "Risikogebiet",
        "fill": colorSet[1]
    },
    {
        "name": "Deutschland",
        "fill": colorSet[3]
    }
];
legend.align = "center";
legend.valign = "top";
legend.background.fill = "#d9d9d9";
legend.itemContainers.template.clickable = false;
legend.itemContainers.template.focusable = false;
legend.itemContainers.template.cursorOverStyle = am4core.MouseCursorStyle.default;

var worldSeries = chart.series.push(new am4maps.MapPolygonSeries());
worldSeries.useGeodata = true;
worldSeries.exclude = ["AQ"];
//worldSeries.mapPolygons.fill = "#9999ff" // TODO

var worldTemplate = worldSeries.mapPolygons.template;
worldTemplate.tooltipText = "{name}";
worldTemplate.fillOpacity = 0.7;
worldTemplate.strokeOpacity = 0.4;
worldTemplate.adapter.add("fill", function(fill, target) {
    let value = target.dataItem.value;
    if (value === undefined) return am4core.color("#d9d9d9");
    let color = colorSet[value];
    if (color === undefined) return am4core.color("#d9d9d9");

    return am4core.color(color);
  });
//worldTemplate.propertyFields.visible = "visible";

var hoverState = worldTemplate.states.create("hover");
hoverState.properties.fillOpacity = 1;



var countrySeries = chart.series.push(new am4maps.MapPolygonSeries());
countrySeries.useGeodata = true;
countrySeries.hide();
countrySeries.geodataSource.events.on("done", function(ev) {
  worldSeries.hide();
  countrySeries.show();
});

var countryTemplate = countrySeries.mapPolygons.template;
var countryDefaultColor = am4core.color("#d9d9d9");
countryTemplate.tooltipText = "{name}\n\n{extra}";
countryTemplate.fillOpacity = 0.7;
countryTemplate.strokeOpacity = 0.4;
countryTemplate.fill = am4core.color("#eee");
countryTemplate.adapter.add("fill", function(fill, target) {
    let value = target.dataItem.value;
    if (value === undefined) return countryDefaultColor;
    let color = colorSet[value];
    if (color === undefined) return countryDefaultColor;

    return am4core.color(color);
});

// Add click listener for potential district map
worldTemplate.events.on("hit", function(ev) {
    ev.target.series.chart.zoomToMapObject(ev.target);
    var map = ev.target.dataItem.dataContext.map;
    if (map) {
        ev.target.isHover = false;
        countrySeries.data = countryData[ev.target.dataItem.dataContext.id]
        countrySeries.geodataSource.url = "https://cdn.amcharts.com/lib/4/geodata/json/" + map + ".json";
        countrySeries.geodataSource.load();
        let countryValue = ev.target.dataItem.dataContext.value;
        if (countryValue == 2) countryDefaultColor = colorSet[0];
        else countryDefaultColor = colorSet[ev.target.dataItem.dataContext.value];
        //backButton.show();
    }
});

// Enhance data by potential district maps
var data = riskData
data.forEach(function(entry, index, array) {
    let id = entry["id"]
    if (am4geodata_data_countries2.hasOwnProperty(id)) {
        var country = am4geodata_data_countries2[id];
        if (country.maps.length && !array[index].hasOwnProperty("map")) {
            array[index]["map"] = country.maps[1];
        }
    }
});
worldSeries.data = data;


// Back button in order to zoom out to world view
// var backButton = chart.createChild(am4core.ZoomOutButton);
// backButton.align = "right";
// backButton.hide();
// backButton.events.on("hit", function(ev) {
//   worldSeries.show();
//   chart.goHome();
//   countrySeries.hide();
//   backButton.hide();
// });

// Home button
var homeButton = chart.chartContainer.createChild(am4core.Button);
homeButton.padding(5, 5, 5, 5);
homeButton.align = "right";
homeButton.marginRight = 15;
homeButton.events.on("hit", function() {
    worldSeries.show();
    chart.goHome();
    countrySeries.hide();
});
homeButton.icon = new am4core.Sprite();
homeButton.icon.path = "M16,8 L14,8 L14,16 L10,16 L10,10 L6,10 L6,16 L2,16 L2,8 L0,8 L8,0 L16,8 Z M16,8";

// Add zoom control
chart.zoomControl = new am4maps.ZoomControl();






// var swedenSeries = chart.series.push(new am4maps.MapPolygonSeries());
// swedenSeries.geodata = am4geodata_swedenHigh
// swedenSeries.data = riskData;

// var swedenTemplate = swedenSeries.mapPolygons.template;
// swedenTemplate.tooltipText = "Sweden: {name}";
// swedenTemplate.fillOpacity = 0.7;
// swedenTemplate.strokeOpacity = 0.4;
// swedenTemplate.strokeWidth = 0.5;
// swedenTemplate.adapter.add("fill", function(fill, target) {
//     var value = target.dataItem.value
//     if (value === undefined) value = 0;
//     let color = colorSet[value]
//     if (color === undefined) return am4core.color("#d9d9d9");

//     return am4core.color(color);
//   });

//   var norwaySeries = chart.series.push(new am4maps.MapPolygonSeries());
//   norwaySeries.geodata = am4geodata_norwayHigh
//   norwaySeries.data = riskData;
  
//   var norwayTemplate = norwaySeries.mapPolygons.template;
//   norwayTemplate.tooltipText = "Norway: {name}";
//   norwayTemplate.fillOpacity = 0.7;
//   norwayTemplate.strokeOpacity = 0.4;
//   norwayTemplate.strokeWidth = 0.5;
//   norwayTemplate.adapter.add("fill", function(fill, target) {
//       var value = target.dataItem.value
//       if (value === undefined) value = 0;
//       let color = colorSet[value]
//       if (color === undefined) return am4core.color("#d9d9d9");
  
//       return am4core.color(color);
//     });

// chart.smallMap = new am4maps.SmallMap();
// chart.smallMap.series.push(polygonSeries);