// DOM definition
var PIE = document.getElementById('piePlot');
var BUBBLE = document.getElementById('bubblePlot');

function buildCharts(sampleData, otuData) {
    var labels = sampleData[0]['otu_ids'].map(function(item) {
        return otuData[item]
    });

    // Build Bubble Chart
    var bubbleLayout = {
        margin: { t: 0 },
        hovermode: 'closest',
        xaxis: { title: 'OTU ID' }
    };
    var bubbleData = [{
        x: sampleData[0]['otu_ids'],
        y: sampleData[0]['sample_values'],
        text: labels,
        mode: 'markers',
        marker: {
            size: sampleData[0]['sample_values'],
            color: sampleData[0]['otu_ids'],
        }
    }];

    Plotly.plot(BUBBLE, bubbleData, bubbleLayout);

    // Build Pie Chart
    var pieData = [{
        values: sampleData[0]['sample_values'].slice(0, 10),
        labels: sampleData[0]['otu_ids'].slice(0, 10),
        hovertext: labels.slice(0, 10),
        hoverinfo: 'hovertext',
        type: 'pie'
    }];

    var pieLayout = {
        margin: { t: 0, l: 0 }
    };

    Plotly.plot(PIE, pieData, pieLayout);
};


function updateData(data) {
    var PANEL = document.getElementById("metaDataSample");

    // Clear existing data
    PANEL.innerHTML = '';

    for(var key in data) {
        h6tag = document.createElement("h6");
        h6Text = document.createTextNode(`${key}: ${data[key]}`);
        h6tag.append(h6Text);

        PANEL.appendChild(h6tag);
    }
}

function getData(sample, callback) {
    Plotly.d3.json(`/samples/${sample}`, function(error, sampleData) {
        if (error) return console.log(error);

        Plotly.d3.json('/otu', function(error, otuData) {
            if (error) return console.log(error);
            callback(sampleData, otuData);
        });
    });

    Plotly.d3.json(`/metadata/${sample}`, function(error, metaData) {
        if (error) return console.log(error);
        updateData(metaData);
    })
}

function getOptions() {
    // Grab a reference to the dropdown select element
    var selector = document.getElementById('selDataset');

    // Use the list of sample names to populate the select options
    Plotly.d3.json('/names', function(error, sampleNames) {
        for (var i = 0; i < sampleNames.length;  i++) {
            var currentOption = document.createElement('option');
            currentOption.text = sampleNames[i];
            currentOption.value = sampleNames[i]
            selector.appendChild(currentOption);
        }

        getData(sampleNames[0], buildCharts);
    })
}

function optionChanged(newSample) {
    getData(newSample, updateCharts);
}

// OPTIONAL: Use Plotly.restyle to update the chart whenever a new sample is selected
function updateCharts(sampleData, otuData) {

    var sampleValues = sampleData[0]['sample_values'];
    var otuIDs = sampleData[0]['otu_ids'];

    // Return the OTU Description for each otuID in the dataset
    var labels = otuIDs.map(function(item) {
        return otuData[item]
    });

    // Update the Bubble Chart
    Plotly.restyle(BUBBLE, 'x', [otuIDs]);
    Plotly.restyle(BUBBLE, 'y', [sampleValues]);
    Plotly.restyle(BUBBLE, 'text', [labels]);
    Plotly.restyle(BUBBLE, 'marker.size', [sampleValues]);
    Plotly.restyle(BUBBLE, 'marker.color', [otuIDs]);

    // Update the Pie Chart
    var pieUpdate = {
        values: [sampleValues.slice(0, 10)],
        labels: [otuIDs.slice(0, 10)],
        hovertext: [labels.slice(0, 10)],
        hoverinfo: 'hovertext',
        type: 'pie'
    };
    Plotly.restyle(PIE, pieUpdate);

}


// init
getOptions();