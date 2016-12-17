define("sap_viz_ext_sankeyadvanced-src/js/flow", ["sap_viz_ext_sankeyadvanced-src/js/module"], function(moduleFunc) {
	var flowRegisterFunc = function() {
		var flow = sap.viz.extapi.Flow.createFlow({
			id: "sap.viz.ext.sankeyadvanced",
			name: "Sankey advanced",
			dataModel: "sap.viz.api.data.CrosstableDataset",
			type: "BorderSVGFlow"
		});
		
		/**
         * Create a dataFilter module with property category 'tooltip'
         * to enable data filter in extension.
         */ 
         
        var dataFilter  = sap.viz.extapi.Flow.createElement({
            id : 'sap.viz.modules.dataFilter'
        });
        flow.addElement({
            'element':dataFilter,
            'propertyCategory' : 'tooltip'
        });
        
		var element = sap.viz.extapi.Flow.createElement({
			id: "sap.viz.ext.sankeyadvanced.PlotModule",
			name: "Sankey advanced Module"
		});
		element.implement("sap.viz.elements.common.BaseGraphic", moduleFunc);

		/*Feeds Definition*/
		var ds1 = {
			"id": "sap.viz.ext.sankeyadvanced.PlotModule.DS1",
			"name": "Nodes",
			"type": "Dimension",
			"min": 1, //minimum number of data container
			"max": 1, //maximum number of data container
			"aaIndex": 1,
		    "minStackedDims": 1,
		    "maxStackedDims": 1
		};
		element.addFeed(ds1);

		var ms1 = {
			"id": "sap.viz.ext.sankeyadvanced.PlotModule.MS1",
			"name": "Flow",
			"type": "Measure",
			"min": 1, //minimum number of measures
			"max": 1, //maximum number of measures
			"mgIndex": 1
		};
		element.addFeed(ms1);

		element.addProperty({
			name: "colorPalette",
			type: "StringArray",
			supportedValues: "",
			defaultValue: d3.scale.category20().range().concat(d3.scale.category20b().range()).concat(d3.scale.category20c().range())
		});

		flow.addElement({
			"element": element,
			"propertyCategory": "plotArea"
		});
		
		sap.viz.extapi.Flow.registerFlow(flow);
	};
	flowRegisterFunc.id = "sap.viz.ext.sankeyadvanced";
	return {
		id: flowRegisterFunc.id,
		init: flowRegisterFunc
	};
});