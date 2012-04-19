SipgatePhoneState
=================

= Wichtiger Hinweis =

Dies ist keine offizielle Software von Sipgate!

= Beschreibung =

Ermittelt den aktuellen Status (wird angerufen, telefoniert) der angeschlossenen Telefone an 
einer virtuellen Telefonanlage von Sipgate.

= Hintergrund =

Als Kunde von Sipgate mit dem Produkt Sipgate Team w�nschten wir uns eine �bersicht �ber den Status 
aller angeschlossenen Telefone - so, wie es zuvor bei unserer lokalen Telefonanlage auch m�glich war.
In dem Portal, welches Sipgate jedem Benutzer zur Verf�gung stellt, ist eine solche �bersicht vorhanden,
die auch in Echtzeit den Status der Durchwahlen anzeigt.
Die vorhandene API bietet eine solche Anzeige derzeit leider noch nicht. Hieraus wuchs die Idee,
das Portal f�r alle Mitarbeiter so darzustellen, dass der Fokus auf den Telefonstatus liegt.

= Aufbau =

Als Basis dient ein ausgemustertes Notebook, welches mit einer aktuellen Ubuntu Desktopversion 
versehen wurde. Statt Firefox wurde Chrome installiert. 
Unity wurde so konfiguriert, dass der (einzige) Benutzer direkt angemeldet wird und beim Hochfahren
chrome im Kioskmodus mit der Sipgate Login Seite gestartet wird:

  chrome --kiosk https://secure.live.sipgate.de
  
Die hier im Repository angeh�ngte css Datei wird in das Verzeichnis "User Stylesheets" von chrome eingef�gt (sie ersetzt oder erg�nzt die Datei Custom.css), welches normalerweise unter 
  
  ~<benutzername>/.config/google-chrome/Default/User\ StyleSheets
  
liegt.

Die im Repository beiligende Javascript Datei erg�nzt das User Stylesheet und k�mmert sich um das automatische Einloggen und das Plazieren der Elemente. Es handelt sich dabei um eine Javascript-Datei, die als Extension nach Chrome installiert wird (hierzu die Javascript Datei einfach auf die Adresszeile von Chrome ziehen und den Abfragen folgen). Vor der Installation ist es auf jeden Fall notwendig, dass die Logindaten des Abfragebenutzers in das Skript eingetragen werden.
(Siehe folgenden Auszug aus der JavaScriptdatei)


[...]

/*
 * UserInformation
 * !!!!! Die folgenden Informationen m�ssen ausgetauscht werden !!!!!!
 * Da sich das Skript selbst einloggen muss,
 * (und ich keine bessere L�sung gefunden habe)
 * m�ssen hier BenutzerId und Passwort einge-
 * tragen werden.
 */
userConfig = {};
userConfig.mainUserId = '1234567';
userConfig.username = 'anybody@unknown.org';
userConfig.password = 'wirklich_schwieriges_passwort';

[...]

Hierbei steht 
- userConfig.mainUserId f�r die eigene SipGate Kundennummer
- userConfig.username   f�r den Loginnamen eines eigenen Benutzers, mit dem der Telefonstatus �berwacht werden soll
- userConfig.password   Passwort des Benutzers, der den Telefonstatus �berwachen soll.

Viel Spa�!