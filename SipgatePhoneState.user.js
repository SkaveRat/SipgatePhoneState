﻿// ==UserScript==
// @name 		SipgatePhoneState
// @namespace 	http://www.okadis.de/
// @description	Führt ein automatisches Login durch und zeigt den Telefonstatus als großen Block von Objekten an.
// @version		1.0
// @include		https://secure.live.sipgate.de/
// @match 		https://secure.live.sipgate.de/*
// @author		Lars Kempkens, okadis Consulting GmbH
// ==/UserScript==


/*
 * UserInformation
 * Da sich das Skript selbst einloggen muss,
 * (und ich keine bessere Lösung gefunden habe)
 * müssen hier BenutzerId und Passwort einge-
 * tragen werden.
 */
userConfig = {};
userConfig.mainUserId = '1234567';
userConfig.username = 'anybody@unknown.org';
userConfig.password = 'wirklich_schwieriges_passwort';

// Die Darstellung der einzelnen Blöcke wird
// von einer Funktion weiter unten vorgenommen,
// die die Ausrichtung an dem virtuellen Gitter
// selbst vornimmt und die beiden Größen als
// globale Zähler nutzt.
var currentCol = 0;
var currentRow = 0;

// Das Blockobjekt erzeugen wir mit einer Vorschlagsgröße,
// um dann später mit besseren Werten weiterrechnen zu 
// können...
var block = new BlockControl(140,4);

/* 
 * Die Klasse kontrolliert die Größe
 * der Blöcke und erlaubt eine Positionierung
 * aller Blöcke mit bestmöglicher Größe
 * in dem gesamten Fenster.
 * Da wir Quader haben wollen, muss nur eine Größe
 * übergeben werden, die für Breite und Höhe in 
 * gleichem Maße gilt. Die Buchstabengröße ist
 * davon ebenfalls abhängig.
 * @param size{int} Breite und Höhe der Blöcke (als Ausgangswert)
 * @param margin{int} Abstand zwischen den Blöcken
 */
function BlockControl(size,margin) {

	// Anfangswert festlegen
	this.width			= size;
	this.height			= size;
	this.margin			= margin;
	this.fontSize		= 0;
	this.nameFontSize	= 0;

	this.numOfBlocks	= 0;

	this.columns		= 0;
	this.rowSize		= 0;
	this.rowOffset		= 0;

	this.rows			= 0;
	this.columnSize		= 0;
	this.columnOffset	= 0;

	this.viewPortWidth	= document.documentElement.clientWidth;
	this.viewPortHeight	= document.documentElement.clientHeight;

	// Get-Methoden
	this.getWidth		= function() { return this.width; };
	this.getHeight		= function() { return this.height; };
	this.getMargin		= function() { return this.margin; };
	this.getFontSize	= function() { return this.fontSize; };
	this.getNameFontSize = function() { return this.nameFontSize; };
	this.getColumnCount	= function() { return this.columns; };
	this.getRowOffset	= function() { return this.rowOffset; };
	this.getColumnOffset	= function() { return this.columnOffset; };
	this.getRowSize		= function() { return this.rowSize; };
	this.getColumnSize	= function() { return this.columnSize; };
	this.getRowCount		= function() { return this.rows; };
	this.getViewPortHeight	= function() { return this.viewPortHeight; };
	this.getViewPortWidth	= function() { return this.viewPortWidth; };
	this.getNumberOfBlocks	= function() { return this.numOfBlocks; };


	// Setzt die Anzahl der Blocks, die relevant sind. Diese
	// Anzahl wird dann genutzt, um die Größe und ähnliche 
	// Werte zu berechnen.
	this.setNumberOfBlocks	= function(numOfBlocks) { 
		// Anzahl der Blocks setzen und Neuberechnung der Größe
		// durchführen
		this.numOfBlocks = numOfBlocks;

		// Neuberechnung der abhängigen Daten
		this.calculate(this.getWidth());

		// Adjustierung der Aufteilung und Größe der Blöcke
		if (this.adjust()) 
			// Nun berechnen wir die einzelnen Daten neu
			this.calculate(this.getWidth()); 
	};

	// Berechnung der abhängigen Größen auf Basis
	// der aktuellen Breite/Länge und der Größe
	// des Bildschirms. Wichtig: Die Größe muss
	// bereits den Abstand enthalten
	this.calculate	= function(size) {
		// Berechnen der Schriftgröße
		this.fontSize	= Math.floor(size * 0.80);
		this.nameFontSize = Math.floor(size * 0.10);
		
		// Berechnen der Anzahl Spalten und Reihen
		this.calculateGrid(size);
		
		// Berechnen der tatsächlichen Länge der Zeile
		this.rowSize = this.getColumnCount() * size;

		// Offset der Spalten für eine saubere Zentrierung
		// ermitteln
		this.rowOffset = this.getViewPortWidth() / 2 
			       			 - this.getRowSize() / 2;

		// Berechnen der tatsächlichen Länge der Zeile
		this.columnSize = this.getRowCount() * size;

		// Offset für eine saubere Zentrierung (vertikal)
		this.columnOffset = Math.floor( this.getViewPortHeight() / 2 - this.getColumnSize() / 2);
	}


	// Berechnet die Anzahl von Spalten, die pro Reihe
	// geliefert werden. Hierfür ist jedoch auch die
	// Anzahl der Blöcke insgesamt interessant.
	this.calculateGrid = function(size) {
		// Bei einem oder weniger Blöcken ist die 
		// Verteilung klar...
		if (this.getNumberOfBlocks() <= 2) {
			this.columns = 1;
			this.rows = 1;
			return;
		}

		// Maximale auf X und Y Achse berechnen
		var maxColumns 	= Math.floor(this.viewPortWidth / size);
		var maxRows			= Math.floor(this.viewPortHeight / size );
		
		// wir berechnen nun die Wurzel aus der Anzahl
		// der zu verteilenden Objekte
		var calculatedColumns = Math.ceil(Math.sqrt(this.getNumberOfBlocks()));
		var calculatedRows = calculatedColumns;

		// Prüfen, ob diese Maxime gegen eine der beiden Richtungen
		// verstößt:
		if (calculatedColumns > maxColumns) {
			var scrap = calculatedColumns - maxColumns;
			calculatedRows += scrap;
			calculatedColumns = maxColumns;
			while (calculatedRows * calculatedColumns < this.getNumberOfBlocks())
				++calculatedRows;
		}

		// Eventuell verändern wir dies nun gleich wieder in die andere Richtung - 
		// in diesem Fall wäre aber der ViewPort einfach nicht groß
		// genug und wir müssten sowieso eine Veränderung der Blockgröße durchführen
		if (calculatedRows > maxRows) {
			var scrap = calculatedRows - maxRows;
			calculatedColumns += scrap;
			calculatedRows = maxRows;
			while (calculatedRows * calculatedColumns < this.getNumberOfBlocks())
				++calculatedColumns;			
		}


		// Berechnen der Anzahl der Reihen
		calculatedRows = Math.ceil(this.getNumberOfBlocks() / calculatedColumns);

		this.columns	= calculatedColumns;
		this.rows			= calculatedRows;		
	};


	// Führt eine Justierung der Verteilung und der Größe der Blöcke
	// abhängig von der tatsächlichen Größe ein
	this.adjust = function() {
		var somethingChanged = false;

		// Nun berechnen wir den Restbestand rechts und unten 
		var rightScrap  = this.segetViewPortWidth() - this.getColumnCount() * this.getWidth();
		var bottomScrap = this.getViewPortHeight() - this.getRowCount() * this.getHeight();

		// Wir können nur den kleineren der beiden verwirklichen (oder 
		// müssen das bei einem negativen Wert sogar):
		var scrap = Math.min(rightScrap, bottomScrap);

		// Den Rest teilen wir jeweils durch die Anzahl von Objekten pro Reihe
		// und Spalte und ermittelt jeweils den kleineren Wert (unabhängig
		// von dem Vorzeichen, den auch im negativen Bereich brauchen wir die
		// kleiner Zahl (= die größer absolute Zahl).
		var columnChange = Math.floor(scrap / this.getColumnCount());
		var rowChange = Math.floor(scrap / this.getRowCount());
		var change = Math.min(columnChange, rowChange);

		if (change != 0) {
			this.width += change;
			this.height += change;
			somethingChanged = true;
		}

		
		// Am Schluss geben wir zurück, ob wir etwas geändert haben und
		// die Daten neu berechnet werden müssen
		return somethingChanged;
	};

}


/* 
 * login
 * Führt ein automatisches Login in der Seite durch. Dieses
 * ist notwendig, wenn es zu einem Autoausuloggen kommt.
 */
function login() {
	// Wir füllen per Skript nun die einzelnen Felder aus:
	var form = document.getElementById('standardlogin');
	form.username.value = userConfig.username;
	form.password.value = userConfig.password;
	form.autologin.checked = true;
	
	// Nun loggen wir uns direkt ein...
	form.submit();
}



/*
 * toPx
 * Gibt einen Wert als Pixel-String für die 
 * Styleangaben wieder zurück
 */
function toPx(value) {
	return value.toString() + "px";
}


/* 
 * buildOverview
 * wir bauen jetzt eine eigene Übersicht über alle
 * vorhandenen Telefone auf, in dem wir uns nach
 * Objekten umschauen, die vom Typ LI sind und die
 * von der ID auf die von uns gesuchte ID passen.
 * Diese Einträge kopieren wir dann mit einer anderen
 * Kennung. Wahrscheinlich wird das dann auch dazu führen,
 * dass die Darstellung automatisch angepasst wird.	 
 */
function buildOverview() {
	// Die Status der Telefone liegen direkt hierdrin
	var phoneStateId = "phoneState-" + userConfig.mainUserId;
	
	// Die Telefonnummern sind in einzelne SPAN Feldern enthalten,
	// die wir nun stück für stück ausblenden...
	var elements = document.getElementsByTagName('span');
	var relElements = new Array();
	
	for (var i=0; i < elements.length; i++) {
		if (phoneStateId == elements[i].id.substring(0,phoneStateId.length)) {
			// Nun löschen wir als erstes den Eintrag mit dieser Id und setzen 
			// einen neuen Eintrag ein, welcher als DIV Eintrag auf dem nächsten 
			// Objekt passt.
			relElements.push(elements[i]);
		}
	}

	// Nun bereiten wir zunächst unsere Blockverteilung auf die
	// Anzahl der zu bearbeitenden Elemente vor
	block.setNumberOfBlocks(relElements.length);

	for (var i=0; i < relElements.length; i++) 
		exchangeElement(relElements[i]);
	

	// Das bereits bestehende Logo müssen wir nun
	// noch direkt unter das Bodyelement schieben,
	// da es nur da noch angezeigt wird. 
	var logo = document.getElementById('logo');
	logo.parentNode.removeChild(logo);
	document.getElementsByTagName('body')[0].appendChild(logo);
};
 
 
/*
 * Austausch der Elemente. Da die Elemente direkt durch Javascript
 * beim Klingeln ihre neue Klasse erhalten, tauschen wir die ursprünglichen
 * Elemente anhand ihrer ID gegen unsere neuen Elemente aus.
 */
function exchangeElement(element) {
	// Zunächst lesen wir den ursprünglichen Inhalt des Elements aus, 
	// dieses enthült nämlich die relevanten Nummer.
	var phoneNumber = element.firstChild.data;
	var id = element.id;
	// Das Elternelement ist eine Link (<a>) mit der Telefonnummer (Durchwahl)
	// und dem eigentlichen Namen des Ziels
	var parent = element.parentNode;
	
	// Im nächsten Schritt löschen wir das Element, welches bereits 
	// vorhanden war:
	parent.removeChild(element);
	var userName = parent.firstChild.data;
	
	var nElement = document.createElement("div");
	nElement.id 		= id;
	nElement.className 	= "okaPhoneState";
	nElement.style.width 	= toPx(block.getWidth() - 2 * block.getMargin());
	nElement.style.height 	= toPx(block.getHeight() - 2 * block.getMargin());
	nElement.style.left 	= toPx((currentCol * block.getWidth()) + block.getRowOffset());
	nElement.style.top  	= toPx((currentRow * block.getHeight()) + block.getColumnOffset());
	nElement.style.fontSize = toPx(block.getFontSize());
	var nTextElement 	= document.createTextNode(phoneNumber);
	nElement.appendChild(nTextElement);
	document.getElementsByTagName("body")[0].appendChild(nElement);
	
	// Nun erzeugen wir noch ein span Objekt, in das wir den Namen packen:
	var nameElement = document.createElement("div");
	nameElement.className = "okaPhoneStateName";
	nameElement.style.fontSize = toPx(block.getNameFontSize());
	nameElement.appendChild(document.createTextNode(userName));
	nElement.appendChild(nameElement);
	
	// Wir plazieren das Objekt über die Reihe und die Spalten...
	++currentCol;
	if (currentCol == block.getColumnCount()) { 
		currentCol = 0;
		++currentRow;
	}
}
 

// Wir warten noch einmal fünf Sekunden, bis wir sicher sind, dass 
// auch wirklich alles komplett übernommen wurde und alle Anfangsskripte
// der Seite durchgelaufen sind.
// Erst danach sind wir sicher, dass auch wirklich alles funktioniert
// hat.
window.setTimeout(function() {		
	if (document.getElementById('standardlogin')) {
		// In diesem Fall müssen wir versuchen uns einzuloggen:
		login();
	} else {
		buildOverview();
	}
}, 5000);