# Opdracht Web Technology

Deze **idividuele** opdracht telt mee voor 40% van je eindresultaat voor het OLOD "Web Technology". 

## Tutorials

Op de volledige opdracht te kunnen maken moeten er 5 tutorials gevolgd worden. Deze tutorials kun je vinden op [gitlab](https://gitlab.ti.howest.be/ti/2025-2026/s3/web-technology/tutorials).

Als suggestie volgt hier een timing voor het oplossen van de tutorials:

| Tutorial        | Nodige kennis | Deadline suggestie    |
| ----------------| ------------- | --------------------- |
| Graphs and Maps | Advanced JS   | 3 oktober             |
| Web APIs        | Advanced JS   | 10 oktober            |
| Canvas and SVG  | OOP in JS     | 17 oktober            |
| Websockets      | OOP in JS     | 14 november           |
| Expresss        | Async / Await | 28 november           |

Harde deadline om alle tutorials af te hebben is **zondag 14 december om 23:59**. Per tutorial maak je een repository aan op gitlab in je [persoonlijke gitlab groep](https://gitlab.ti.howest.be/ti/2025-2026/s3/web-technology/students). Zorg dat je voldoende en op een gestructureerde manier commits maakt.

## Opdracht

- [x] Dataset
- [x] Weergeven van data
- [x] Toevoegen van data
- [x] Backend server
- [x] Real-time communication

Voor de opdracht bouwen jullie een web-applicatie die data visualiseert.

Deadline van deze opdracht is zondag 4 januari 23:59. De volgende zaken moeten ingediend worden:
- Een video waarin je de **functionaliteit** van je applicatie demonstreert. Hiervoor is er een Leho opdracht gemaakt.
- De code van de applicatie zelf, maak hiervoor een gitlab project met de naam *project* aan in je [persoonlijke gitlab groep](https://gitlab.ti.howest.be/ti/2025-2026/s3/web-technology/students).

### De dataset

*Hier kan je aan beginnen voor je een tutorial maakt*

Jullie mogen zelf op zoek gaan naar een geschikte dataset. Zoek bijvoorbeeld op [kaggle](https://www.kaggle.com/datasets) naar een dataset die je aanspreekt.

Hou wel rekening met de volgende zaken:
- Het is niet toegestaan om de vaccinatie-dataset uit de tutorials te gebruiken
- Zorg dat de dataset locatiegegevens bevat (in de vorm van latitude en longitude)
- Zorg dat je genoeg data heb om voldoende grafieken te kunnen tonen
- Zorg dat je genoeg variatie in de data hebt zodat je verschillende types grafieken kunt maken

### Weergeven van data

*Hier kan je aan beginnen nadat je de tutorial "Graphs and Maps" gemaakt hebt*

Voorzie een webpagina waar **ten minste** 3 visualisaties te zien zijn. Zorg voor minstens 2 verschillende types van visualisaties (line chart, bar chart, doughnut chart, kaart, ...). Maak hierbij gebruik van de tutorials uit de tutorial "Graphs and Maps".

Initieel mag de data gewoon bijgehouden worden als globale variabele in je javascript code. Later gaan we die gaan opvragen van een backend server.

### Toevoegen van data

*Hier kan je aan beginnen nadat je de tutorial Web APIs* gemaakt hebt.*

Zorg voor een webpagina waarmee je data kunt toevoegen aan de dataset (aan de globale variabele dus). Voor de locatiegebonden data moet het mogelijk zijn om de live locatie van de gebruiker automatisch te gebruiken. Maark hiervoor gebruik van de "Geolocation API" zoals gezien in de tutorial "Web APIs".

### Backend server

*Hier kan je aan beginnen nadat je de tutorial "Express" gemaakt hebt.*

Maak de data toegangkelijk vanuit een nodejs express server die gebruikt maakt van een database. Implementeer tenminste 2 GET routes om data op te halen, en 1 POST route om data toe te voegen.

Maak hiervoor gebruik van de technieken gezien in de tutorial "Express". Vermijd dus om alles in 1 file te zetten.

### Real-time communication

*Hier kan je aan beginnen ndat je de tutorial "Websockets" gemaakt hebt.*

Zorg ervoor dat als er data toegevoegd wordt op de server, dit in real-time aangepast wordt op de pagina met grafieken, dus zonder dat de pagina gerefreshed moet worden. Doe dit door gebruik te maken van de technieken gezien in de tutorial "Websockets". Doe het op de native manier en maak gebruik van de express server die je al hebt.