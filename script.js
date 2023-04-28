/**
 * 
 */

    window.name = "Schnittstellendialog";
    window.addEventListener("message", async function(event) {
                            
        //1.3 Im Widget die empfangenen daten darstellen:
        setSys2(event.data.name);
    }); 
    
    /*
    * Globale Variablen
    */
    const urlParams = new URLSearchParams(window.location.search);
    var testJSON = '{"2472":["PP_2500","PP_2500"],"2500":["PP_2472","PP_2472"]}';
    var portsLinks = new Map();
    var portsRechts = new Map();
    let svgArtboard = document.querySelector('#svgArtboard');
    let startPoint = svgArtboard.createSVGPoint();
    let endPoint = svgArtboard.createSVGPoint();
    let dragged = document.createElement("div");
    
    
    if(urlParams.has('sys')){
      	document.getElementById("sys1Beschreibung").innerHTML = urlParams.get('nr') + "<br>" + urlParams.get('sys');
    }
    else{
    	//alert auskommentiert für entwicklung
        //alert("es wurde kein System ausgewählt! Bitte in der Bauspec erst ein Artefakt eines Baugruppen-Kapitel auswählen und dialog erneut öffnen!");
    }
    
  
    function init(jsonString){
    	var text = JSON.parse(jsonString);
    	
    	//Regulärer Ausdruck zum finden von Nummern
    	var regex = /\d+/g;
    	var linkeMBGVNummer = document.getElementById('linkesSystem').innerText.match(regex);
    	var rechteMBGVNummer = document.getElementById('rechtesSystem').innerText.match(regex);
    	if(text[linkeMBGVNummer]){
    		for(let i = 0; i < text[linkeMBGVNummer].length; i++){
    			portHinzufuegenLinks(text[linkeMBGVNummer][i]);
    		}
    		console.log("nö");
    	}
    	else{
    		
    		console.log("jo");
    	}
    	if(text[rechteMBGVNummer]){
    		for(let i = 0; i < text[rechteMBGVNummer].length; i++){
    			portHinzufuegenRechts(text[rechteMBGVNummer][i]);
    		}
    		console.log("jo");
    	}
    	else{
    		
    		console.log("nö");
    	}
    	
    }



    
    /*
    * Funktion, um Ports links hinzuzufügen, es wird ein Schnittstellenname übergeben und dieser
    * in Kindelement input als Wert übergeben. Jeder Port wird in der Map portsLinks gespeichert.
    * Wenn ein Wert der Map gelöscht ist wird der zugehörige Key gefunden und der neue Port als Wert 
    * dort gespeichert.
    * Danach wird das HTML Element erzeugt, Port mit Beschriftung und Input als Kinder.
    * Dieses Element wird in der Map gespeichert. Die Position des Element wird angepasst und 
    * die Eventlisteners gesetzt. Abschließend werden die Positionen aller SVG Linien geupdatet
    * 
    * Input: Schnittstellenname nach MBSE Nomenklatur PP_XXXX
    *
    * Output: -
    * 
    */
    function portHinzufuegenLinks(schnittstellenname){
    	if(!schnittstellenname){
    		schnittstellenname = "";
    	}
    	
    	var portNameLinks;
    	
    	//Finden von Key mit value null
    	if(portsLinks.size > 0){
    		portsLinks.forEach(function(element, key){
    			if(element == null){
    				portNameLinks = key;
    			}
    		});
    	}

    	//Sonderfall, falls noch kein Port vorhanden
    	if(!portNameLinks){
    		portNameLinks = "port1" + portsLinks.size;
    	}
    	
    	
    	//Regulärer Ausdruck zum finden von Nummern
    	var regex = /\d+/g;
    	
    	//Finden der Nummer des Port zur späteren Verwendung in der id der Portbeschriftung
    	//Somit haben die Paare eine zugehörige ID
    	var portNummer = portNameLinks.match(regex);
    	
    	var portBeschriftungNameLinks = "portBeschriftung" + portNummer;
    	
        //HTML-Code für Port und Portbeschriftung zusammensetzen und zur Oberflaeche hinzufuegen: 
        let htmlCode =  '<div id="' + portNameLinks + '" draggable="true" class="port portLinks">'+
                    '<div id="' + portBeschriftungNameLinks + '" class="portBeschriftung portBeschriftungLinks">'+
                    '   <input type="text" placeholder="Schnittstelle benennen!" value="'+ schnittstellenname +'">'+
                    '   <select>'+
                    '       <option>Daten</option>'+
                    '       <option>Elektrisch</option>'+
                    '       <option>Mechanisch</option>'+
                    '       <option>Dampf</option>'+
                    '       <option>Elektronenwolken</option>'+
                    '       <option>Siemens-Lufthaken</option>'+
                    '    </select>'+
                    '</div>'+
                    '</div>';
        let html = $.parseHTML(htmlCode);
        $("#portContainerLinks").append(html);
        
        //Map der PortsLinks updaten
        portsLinks.set(html[0].id,html[0]);

        //Ports gleichmaeßig verteilen:
       	updatePortsLinksPosition();
        
      //Eventlisteners den Ports hinzufügen
        setEventListeners(html);
      
      //Position der svg Lines updaten
        updateSVGLine();
    }
    
    
    /*  
    * Position der Ports auf der linken Seite wird upgedated
    * Es wird durch die map portsLinks itereriert und einem Array
    * an vorhandenen Ports der Key hinzugefügt wenn ein Port vorhanden ist.
    * Danach kann mit diesen Keys über die map die Position aller vorhandenen
    * Ports iteriert werden.
    *
    */
    function updatePortsLinksPosition(){
    	const iteratorPortsLinks = portsLinks[Symbol.iterator]();
       	let vorhandenePortsLinksKeys = new Array();
       	
       	for (const item of iteratorPortsLinks) {
       		if(item[1]){
       			vorhandenePortsLinksKeys.push(item[0]);
       		}
       	}
       	
       	for(let i = 0; i < vorhandenePortsLinksKeys.length; i++){
       		if(vorhandenePortsLinksKeys.length == 1){
       			portsLinks.get(vorhandenePortsLinksKeys[i]).style.top = "50%";
       		}
       		else{
       			portsLinks.get(vorhandenePortsLinksKeys[i]).style.top = (i/(vorhandenePortsLinksKeys.length-1))*100 + '%';
       		}
       	}
    }
    

    
    /*
     * Funktion, um Ports rechts hinzuzufügen, es wird ein Schnittstellenname übergeben und dieser
     * in Kindelement input als Wert übergeben. Jeder Port wird in der Map portsRechts gespeichert.
     * Wenn ein Wert der Map gelöscht ist wird der zugehörige Key gefunden und der neue Port als Wert 
     * dort gespeichert.
     * Danach wird das HTML Element erzeugt, Port mit Beschriftung und Input als Kinder.
     * Dieses Element wird in der Map gespeichert. Die Position des Element wird angepasst und 
     * die Eventlisteners gesetzt. Abschließend werden die Positionen aller SVG Linien geupdatet
     * 
     * Input: Schnittstellenname nach MBSE Nomenklatur PP_XXXX
     *
     * Output: -
     * 
     */
    function portHinzufuegenRechts(schnittstellenname){
    	
    	if(!schnittstellenname){
    		schnittstellenname = "";
    	}
    	
		var portNameRechts;
    	
    	//Finden von Key mit value null
    	if(portsRechts.size > 0){
    		portsRechts.forEach(function(element, key){
    			if(element == null){
    				portNameRechts = key;
    			}
    		});
    	}

    	//Sonderfall, falls noch kein Port vorhanden
    	if(!portNameRechts){
    		portNameRechts = "port2" + portsRechts.size;
    	}
    	
    	//Regulärer Ausdruck zum finden von Nummern
    	var regex = /\d+/g;
    	
    	//Finden der Nummer des Port zur späteren Verwendung in der id der Portbeschriftung
    	//Somit haben die Paare eine zugehörige ID
    	var portNummer = portNameRechts.match(regex);
    	
    	var portBeschriftungNameRechts = "portBeschriftung" + portNummer;
    	
        //HTML-Code für Port und Portbeschriftung zusammensetzen und zur Oberflaeche hinzufuegen: 
        let htmlCode =  '<div id="' + portNameRechts + '" draggable="true" class="port portRechts" >'+
                    '<div id="' + portBeschriftungNameRechts + '" class="portBeschriftung portBeschriftungRechts">'+
                    '   <input type="text" placeholder="Schnittstelle benennen!" value="'+ schnittstellenname +'">'+
                    '   <select>'+
                    '       <option>Daten</option>'+
                    '       <option>Elektrisch</option>'+
                    '       <option>Mechanisch</option>'+
                    '       <option>Dampf</option>'+
                    '       <option>Elektronenwolken</option>'+
                    '       <option>Siemens-Lufthaken</option>'+
                    '    </select>'+
                    '</div>'+
                    '</div>';
        let html = $.parseHTML(htmlCode);
        $("#portContainerRechts").append(html);

        //Map der PortsLinks updaten
        portsRechts.set(html[0].id,html[0]);
        
        //Ports gleichmaeßig verteilen:
        updatePortsRechtsPosition();
        
        //Eventlisteners den Ports hinzufügen
        setEventListeners(html);
        
        //Position der svg Lines updaten
        updateSVGLine();
    }
    
    
    /*  
     * Position der Ports auf der rechten Seite wird upgedated
     * Es wird durch die map portsLinks itereriert und einem Array
     * an vorhandenen Ports der Key hinzugefügt wenn ein Port vorhanden ist.
     * Danach kann mit diesen Keys über die map die Position aller vorhandenen
     * Ports iteriert werden.
     *
     */
    function updatePortsRechtsPosition(){
    	const iteratorPortsRechts = portsRechts[Symbol.iterator]();
       	let vorhandenePortsRechtsKeys = new Array();
       	
       	for (const item of iteratorPortsRechts) {
       		if(item[1]){
       			vorhandenePortsRechtsKeys.push(item[0]);
       		}
       	}
       	
       	for(let i = 0; i < vorhandenePortsRechtsKeys.length; i++){
       		if(vorhandenePortsRechtsKeys.length == 1){
       			portsRechts.get(vorhandenePortsRechtsKeys[i]).style.top = "50%";
       		}
       		else{
       			portsRechts.get(vorhandenePortsRechtsKeys[i]).style.top = (i/(vorhandenePortsRechtsKeys.length-1))*100 + '%';
       		}
       	}
    }
    
    
    function setSys2(sysName){
        //Formatierung von Sys undefiniert auf Sys definert ändern:
        document.getElementById('rechtesSystem').classList.remove('sysNichtZugeordnet');
        document.getElementById('rechtesSystem').classList.add('sysZugeordnet');

        let htmlCode =  '<div class="sysBeschreibung">'+sysName+
                        '</div>'+
                        '<div id="portContainerRechts" class="portContainer">'+
                        '</div>'+
                        '<img src="Images/plus.png" onclick="portHinzufuegenRechts()">';
        document.getElementById('rechtesSystem').innerHTML = htmlCode;                
    }


    /*Funktion macht beispielsweise aus "3100" Folgendes: "BL_BA_3100" um der MBSE-Namenskonvention zu entsprechen:
    * mit baugruppennummer als String
    *
    */
    function getBlockname(baugruppennummer){

        let bgArt = "";
        if(baugruppennummer[1]=='0' && baugruppennummer[2]=='0' && baugruppennummer[3]=='0'){
            bgArt = "HBA";
        }else if(baugruppennummer[2]=='0' && baugruppennummer[3]=='0') {
            bgArt = "BA";
        }else if(baugruppennummer[3]=='0'){
            bgArt = "HBGR";
        }else{
            bgArt = "BGR";
        }
       

        return "BL_"+bgArt+"_"+baugruppennummer; 
    }

    bestehendePortsHolenUndDarstellen();

    
    
    
    function bestehendePortsHolenUndDarstellen(){

        //Bestehende Ports von Widget holen:
        portsAbfragen();
    }

    
    
    function portsAbfragen(){
        top.window.postMessage({getPorts: [urlParams.get('nr'),urlParams.get('sys')]}, '*');
        console.log("ports");
    }
    
    
    /****************************************************/
    /*                  PortsToTrash                    */
    /*                                                  */
    /****************************************************/
    trash.addEventListener("dragover",function(ereignis){
        ereignis.preventDefault();
        ereignis.dataTransfer.dropEffect = "move";
    });
    
    trash.addEventListener("drop",function(ereignis){
         ereignis.preventDefault;
         trash.classList.add("unsichtbar");
         ereignis.target.classList.remove("trashtarget");
         const ausgeleseneID = ereignis.dataTransfer.getData("text/plain");
         const gezogenesElement = document.getElementById(ausgeleseneID);
         //const ausgeleseneKinder = ausgeleseneID.slice(0, 4) + "Beschriftung" + ausgeleseneID.slice(4);
         //const gezogeneKinder = document.getElementById(ausgeleseneKinder);
         var svgLines = document.getElementsByClassName("svgConnectors");
         var gezogenesElementID;
         if(gezogenesElement){
         	gezogenesElementID = gezogenesElement.id;
         }
         if(svgLines){
        	 var svgLength = svgLines.length;
          for(let i = svgLength-1; i > -1; i--){
          	if(document.getElementById(svgLines[i].id).id.split("_").find(element => element == gezogenesElementID)){
          		svgLines[i].remove();
          	}
          }
         }
         //Überprüfen ob der das gezogenen Element existiert und welcher Seite es angehört
         if(gezogenesElement){
            if(portsLinks.has(gezogenesElement.id)){
            	portsLinks.set(gezogenesElement.id, null);
            	gezogenesElement.remove();
            	//gezogeneKinder.remove();
            }
            if(portsRechts.has(gezogenesElement.id)){
            	portsRechts.set(gezogenesElement.id, null);
            	gezogenesElement.remove();
            	//gezogeneKinder.remove();
            }
        }
         
     });
   
    trash.addEventListener("dragenter", function(ereignis){
    	trash.classList.add("trashtarget");
    });
     
     trash.addEventListener("dragleave", (event) => {
		// reset background of potential drop target when the draggable element leaves it
		event.target.classList.remove("trashtarget");
		console.log("dragleave");
	});

    
    //Anteil Lennard SVG Linie zeichnen
    


    function setEventListeners(html){
        var trash = document.getElementById("trash");
        if(html[0].classList == "port portLinks"){
    		// events fired on the draggable target
    		var source = html[0];
    		source.addEventListener("drag", (event) => {
    			event.preventDefault();
    			console.log(event);
    			drawDraggableSVGLine(event);
    		  console.log("dragging");
    		});

    		source.addEventListener("dragstart", (event) => {
                trash.classList.remove("unsichtbar");
                event.dataTransfer.setData("text/plain", event.target.id);
    		  // store a ref. on the dragged elem
    		  dragged = event.target;
    		  // make it half transparent
    		  event.target.classList.add("dragging");
    		  console.log("added dragging");
    		});

    		source.addEventListener("dragend", (event) => {
    		  // reset the transparency
    		  event.target.classList.remove("dragging");
    		  if(document.getElementById(event.srcElement.id + '_Linie')){
    		  	document.getElementById(event.srcElement.id + '_Linie').remove();
    		  }
    		  trash.classList.add("unsichtbar");
    		  console.log("removed dragging");
    		});
    	}

        if(html[0].classList == "port portRechts"){
    		// events fired on the drop targets
    		var target = html[0];
    		console.log("add droptarget");
    		target.addEventListener("dragover",  (event) => {
    		    // prevent default to allow drop
    		    event.preventDefault();
    		  },false);

            target.addEventListener("dragstart", (event) => {
                trash.classList.remove("unsichtbar");
                event.dataTransfer.setData("text/plain", event.target.id);
    		    // store a ref. on the dragged elem
    		    dragged = event.target;
    		    // make it half transparent
    		    event.target.classList.add("dragging");
    		    console.log("added dragging");
    		});
            
            target.addEventListener("dragend", (event) => {
      		  // reset the transparency
      		  event.target.classList.remove("dragging");
      		  trash.classList.add("unsichtbar");
      		  console.log("removed dragging");
      		});

    		target.addEventListener("dragenter", (event) => {
                console.log("dragenter vor if");
    		  // highlight potential drop target when the draggable element enters it
    		  console.log(event.target);
    		  if (event.target.classList.contains("portRechts")) {
    		    event.target.classList.add("dragover");
    		    console.log("dragenter");
    		  }
    		});

    		target.addEventListener("dragleave", (event) => {
    		  // reset background of potential drop target when the draggable element leaves it
    		  if (event.target.classList.contains("portRechts")) {
    		    event.target.classList.remove("dragover");
    		    console.log("dragleave");
    		  }
    		});

    		target.addEventListener("drop", (event) => {
    		  // prevent default action (open as link for some elements)
    		  event.preventDefault();
    		  // move dragged element to the selected drop target
    		  if (event.target.classList.contains("portRechts")) {
    		    event.target.classList.remove("dragover");
                savePorts(event);
                saveLine(event);
    		    console.log("drop");
    		  }
    		});
    	}
    }


    /*
    * Abspeichern des Portnamens aus dem Beschreibungstext des Kindelements der Ports
    *
	* Input: event zur Untersuchung der Target ids
	* 
    */
    function savePorts(event){
    	console.log('TargetPortName ' + event.srcElement.children[0].innerHTML.slice(event.srcElement.children[0].innerHTML.indexOf("placeholder")+13,event.srcElement.children[0].innerHTML.indexOf("\">")))
        console.log('TargetClassnames ' + event.srcElement.className);
        console.log('TargetId ' + event.srcElement.id);
        console.log('SourcePortName ' + dragged.children[0].innerHTML.slice(dragged.children[0].innerHTML.indexOf("placeholder")+13,dragged.children[0].innerHTML.indexOf("\">")));
        console.log('SourceClassnames ' + dragged.className);
        console.log('SourceId ' + dragged.id);  
    }
    

    
    /*
    * Funktion zur Speichern des Connectornamens in der ID der Line
    * StartId_ZielID_Linie
    *
    */
    function saveLine(event){
        var svgLinie = document.getElementById(dragged.id + '_Linie');
        if(!svgLinie){
            console.log("keine Linie");
        }
        else{
            svgLinie.id  = svgLinie.id.slice(svgLinie.id.indexOf('p'),svgLinie.id.indexOf('_Linie')) + '_' + event.srcElement.id + '_Linie';
            console.log(svgLinie);
        }
    }

    
    
    function drawDraggableSVGLine(event){
    	//Holen der Linie welche nur mit gezogenem Port verbunden ist
    	var svgLinie = document.getElementById(event.srcElement.id + '_Linie');
    	var svgLinieName;
    	//Falls keine Linie vorhanden neues SVG Element in oberer linker Ecke erstellen
    	if(!svgLinie){
    		svgLinieName = event.srcElement.id + '_Linie';
    		d3.select("#svgArtboard").append("line")
            .style("stroke", "black")
            .style("stroke-width", 3)
            .attr("class", "svgConnectors")
            .attr("id", svgLinieName)
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", 0); ;
    	}
    	
    	//Finden des Mittelpunkts des gezogenen Startports
    	var rect = event.srcElement.getBoundingClientRect();
    	let xCoord = Math.round(((rect.right - rect.left) / 2 ) + rect.left);
    	let yCoord = Math.round(((rect.bottom - rect.top) / 2 ) + rect.top);
    	//Setzen der Startkoordinaten auf Mittelpunkt des Startports
    	startPoint.x = xCoord;
    	startPoint.y = yCoord;
    	endPoint.x = event.clientX;
    	endPoint.y = event.clientY;
    	let svgStartPoint = startPoint.matrixTransform(svgArtboard.getScreenCTM().inverse());
    	let svgEndPoint = endPoint.matrixTransform(svgArtboard.getScreenCTM().inverse());
    	var neueLinie = document.getElementById(event.srcElement.id + '_Linie');
    	neueLinie.setAttribute("x1", Math.round(svgStartPoint.x));
    	neueLinie.setAttribute("y1", Math.round(svgStartPoint.y));
    	neueLinie.setAttribute("x2", Math.round(svgEndPoint.x));
    	neueLinie.setAttribute("y2", Math.round(svgEndPoint.y));
    	console.log(svgStartPoint);
    	console.log(svgEndPoint);
    	console.log(xCoord, yCoord);
    	console.log(event.screenX,event.screenY);
    }
    
    
    
    
    function updateSVGLine(){
    	var svgLines = document.getElementsByClassName("svgConnectors");
    	if(!svgLines){
    		
    	}
    	else{
    		for(let i = 0; i < svgLines.length; i++){
    			var sourcePortName = svgLines[i].id.slice(svgLines[i].id.indexOf('port'),svgLines[i].id.indexOf('_'));
    			var targetPortName = svgLines[i].id.slice(svgLines[i].id.indexOf('_')+1,svgLines[i].id.indexOf('_Linie'));
    			var sourcePort = document.getElementById(sourcePortName);
    			var targetPort = document.getElementById(targetPortName);
    			if(!sourcePort || !targetPort){
    				svgLines[i].remove();
    			}
    			else{
        			var sourcePortRect = sourcePort.getBoundingClientRect();
        			var sourceLeft = sourcePortRect.left + window.scrollX;
        			var sourceTop =  sourcePortRect.top + window.scrollY;
        			var sourceRight = sourcePortRect.right + window.scrollX;
        			var sourceBottom =  sourcePortRect.bottom + window.scrollY;
        			var sourceXYCoord = svgArtboard.createSVGPoint();
        			sourceXYCoord.x = Math.round(((sourceRight - sourceLeft) / 2 ) + sourceLeft);
        			sourceXYCoord.y = Math.round(((sourceBottom - sourceTop) / 2 ) + sourceTop);
	    	
        	    	let svgSourceCoord = sourceXYCoord.matrixTransform(svgArtboard.getScreenCTM().inverse());

        			var targetPortRect = targetPort.getBoundingClientRect();
        			var targetLeft = targetPortRect.left + window.scrollX;
        			var targetTop =  targetPortRect.top + window.scrollY;
        			var targetRight = targetPortRect.right + window.scrollX;
        			var targetBottom =  targetPortRect.bottom + window.scrollY;
        			var targetXYCoord = svgArtboard.createSVGPoint();
        			targetXYCoord.x = Math.round(((targetRight - targetLeft) / 2 ) + targetLeft);
        			targetXYCoord.y = Math.round(((targetBottom - targetTop) / 2 ) + targetTop);
	    	
        	    	let svgTargetCoord = targetXYCoord.matrixTransform(svgArtboard.getScreenCTM().inverse());
   			
        			svgLines[i].setAttribute("x1", Math.round(svgSourceCoord.x));
        	    	svgLines[i].setAttribute("y1", Math.round(svgSourceCoord.y));
        	    	svgLines[i].setAttribute("x2", Math.round(svgTargetCoord.x));
        	    	svgLines[i].setAttribute("y2", Math.round(svgTargetCoord.y));
    			}
    		}
    	}
    }

/*{
	"Partname":
		{
			"Portname":
				{
					"label":"label in Rhapsody";
					"interfaceBlock":"interfaceBlockname",
					"direction":"which direction",
					"multiplicity":"1",
					"connectors":
							{
								"from":"startpartname",
								"to":"stoppartname",
								"name":"connectorname"
							}
				}
		}
}


your example

{
	"PT_HBGR_2620":
		{
			"Port123":
				{
					"label":"label in Rhapsody",
					"interfaceBlock":"StubInterfaceBlock",
					"direction":"bidirectional",
					"multiplicity":"1",
					"connectors":
							{
								"from":"PT_BGR_2441_portC",
								"to":"PT_HBGR_2620_Port123",
								"name":"PT_BGR_2441_PT_Verstellpropeller"
							}
				},
			"Aufnahme":
				{
					"label":"label in Rhapsody",
					"interfaceBlock":"IB_Welle",
					"direction":"in",
					"multiplicity":"1",
					"connectors":
							{
								"from":"PT_BGR_2441_portB",
								"to":"PT_HBGR_2620_Aufnahme",
								"name":"PT_BGR_2441_PT_Verstellpropeller"
							}
				},
			"Proxyport_5":
				{
					"label":"label in Rhapsody",
					"interfaceBlock":"StubInterfaceBlock",
					"direction":"bidirectional",
					"multiplicity":"1",
					"connectors":
							{
								"from":"PT_HBGR_2620_Proxyport_5",
								"to":"PT_BGR_2441_portA",
								"name":"PT_Verstellpropeller_PT_BGR_2441"
							}
				}
		},
	"PT_BGR_2441":
		{
			"portC":
				{
					"label":"label in Rhapsody",
					"interfaceBlock":"StubInterfaceBlock",
					"direction":"bidirectional",
					"multiplicity":"1",
					"connectors":
							{
								"from":"PT_BGR_2441_portC",
								"to":"PT_HBGR_2620_Port123",
								"name":"PT_BGR_2441_PT_Verstellpropeller"
							}
				},
			"portA":
				{
					"label":"label in Rhapsody",
					"interfaceBlock":"IB_Welle",
					"direction":"in",
					"multiplicity":"1",
					"connectors":
							{
								"from":"PT_HBGR_2620_Proxyport_5",
								"to":"PT_BGR_2441_portA",
								"name":"PT_Verstellpropeller_PT_BGR_2441"
							}
				},
			"portB":
				{
					"label":"label in Rhapsody",
					"interfaceBlock":"IB_Welle",
					"direction":"in",
					"multiplicity":"1",
					"connectors":
							{
								"from":"PT_BGR_2441_portB",
								"to":"PT_HBGR_2620_Aufnahme",
								"name":"PT_BGR_2441_PT_Verstellpropeller"
							}
				}
		}
}*/

   
