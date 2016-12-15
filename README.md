Advanced Sankey Diagram - SAP Lumira visualization extension
=================================================
Unlike any other SAP Lumira extensions, the presented advanced sankey chart enables to track the whole processes. 

 ![Sankey Diagram](images/overview.gif?raw=true "Advanced Sankey Diagram")
 
By [Michal Korzen](http://scn.sap.com/people/michal.korzen)

Files
-----------
* `sap.viz.ext.sankeyadvanced.zip` - SAP Lumira visualization extension, packaged by SAP Web IDE
* `sample.lums` - sample SAP Lumira document
* `sample_dataset.xlsx` - sample dataset used in attached SAP Lumira document

Data Binding
-------------------------------------------
<strong>Measures (Value)</strong>
* Value 

<strong>Dimensions (Nodes)</strong>
* Combined pathflow (delimited with ">" [greater-than sign]) 

Limitations
-------------------------------------------
* Paths above 10 nodes are cut (only 10 first nodes are displayed)
* Filtering works on array of paths contexts, thus be aware that only visible paths may be filtered/excluded (tricky while using ranking)

Credits
-------------------------------------------
Vizualization based on [d3.js](https://d3js.org/) [sankey extension by Mike Bostock](https://bost.ocks.org/mike/sankey/)