-- ------------------------------
-- DB Modell zu WebAnwendungen 2, Version 3.0
-- Create Table Statements

-- ------------------------------
-- Produkte
CREATE TABLE Produktkategorie (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	bezeichnung TEXT NOT NULL
);

CREATE TABLE Mehrwertsteuer (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	bezeichnung TEXT NOT NULL,
	steuerSatz REAL NOT NULL DEFAULT 19.0
);

CREATE TABLE Download (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	bezeichnung TEXT NOT NULL,
	beschreibung TEXT NOT NULL,
	dateipfad TEXT NOT NULL
);

CREATE TABLE Produkt (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	bildpfad TEXT NOT NULL,
	kategorieId INTEGER NOT NULL,
	bezeichnung TEXT NOT NULL,
	beschreibung TEXT NOT NULL,
	mehrwertsteuerId INTEGER NOT NULL,
	details TEXT DEFAULT NULL,
	nettopreis REAL NOT NULL DEFAULT 0.0,
	datenblattId INTEGER DEFAULT NULL,
	CONSTRAINT fk_Produkt1 FOREIGN KEY (kategorieId) REFERENCES Produktkategorie(id),
	CONSTRAINT fk_Produkt2 FOREIGN KEY (mehrwertsteuerId) REFERENCES Mehrwertsteuer(id),
	CONSTRAINT fk_Produkt3 FOREIGN KEY (datenblattId) REFERENCES Download(id)
);

CREATE TABLE Produktbild (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	bildpfad TEXT NOT NULL,
	produktId INTEGER NOT NULL,
	CONSTRAINT fk_Produktbild1 FOREIGN KEY (produktId) REFERENCES Produkt(id)
);

-- ------------------------------
-- Person, Adresse
CREATE TABLE Land (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	kennzeichnung TEXT NOT NULL,
	bezeichnung TEXT NOT NULL	
);

CREATE TABLE Adresse (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	strasse TEXT NOT NULL,
	hausnummer TEXT NOT NULL,
	adresszusatz TEXT NOT NULL,
	plz TEXT NOT NULL,
	ort TEXT NOT NULL,
	landId INTEGER NOT NULL,
	CONSTRAINT fk_Adresse1 FOREIGN KEY (landId) REFERENCES Land(id)
);

CREATE TABLE Person (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	anrede INTEGER NOT NULL DEFAULT 0,
	vorname TEXT NOT NULL,
	nachname TEXT NOT NULL,
	adresseId INTEGER NOT NULL,
	telefonnummer TEXT NOT NULL,
	email TEXT NOT NULL,
	geburtstag TEXT DEFAULT NULL,
	CONSTRAINT fk_Person1 FOREIGN KEY (adresseId) REFERENCES Adresse(id)
);

-- ------------------------------
-- Firma
CREATE TABLE Branche (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	bezeichnung TEXT NOT NULL
);

CREATE TABLE Firma (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	inhaber TEXT DEFAULT NULL,
	beschreibung TEXT NOT NULL,
	adresseId INTEGER NOT NULL,
	ansprechpartnerId INTEGER DEFAULT NULL,
	brancheId INTEGER DEFAULT NULL,
	CONSTRAINT fk_Firma1 FOREIGN KEY (adresseId) REFERENCES Adresse(id),
	CONSTRAINT fk_Firma2 FOREIGN KEY (ansprechpartnerId) REFERENCES Person(id),
	CONSTRAINT fk_Firma3 FOREIGN KEY (brancheId) REFERENCES Branche(id)
);

-- ------------------------------
-- Termine
CREATE TABLE Termin (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	bezeichnung TEXT NOT NULL,
	beschreibung TEXT NOT NULL,
	zeitpunkt TEXT NOT NULL,
	dauer INTEGER NOT NULL DEFAULT 60,
	dienstleisterId INTEGER DEFAULT NULL,
	CONSTRAINT fk_Termin1 FOREIGN KEY (dienstleisterId) REFERENCES Firma(id)
);

-- ------------------------------
-- Bestellwesen
CREATE TABLE Zahlungsart (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	bezeichnung TEXT NOT NULL
);

CREATE TABLE Bestellung (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	bestellzeitpunkt TEXT NOT NULL,
	bestellerId INTEGER DEFAULT NULL,
	zahlungsartId INTEGER NOT NULL,
	CONSTRAINT fk_Bestellung1 FOREIGN KEY (bestellerId) REFERENCES Person(id),
	CONSTRAINT fk_Bestellung2 FOREIGN KEY (zahlungsartId) REFERENCES Zahlungsart(id)
);

CREATE TABLE Bestellposition (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	bestellungId INTEGER NOT NULL,
	produktId INTEGER NOT NULL,
	menge INTEGER NOT NULL DEFAULT 1,
	CONSTRAINT fk_Bestellposition1 FOREIGN KEY (bestellungId) REFERENCES Bestellung(id),
	CONSTRAINT fk_Bestellposition2 FOREIGN KEY (produktId) REFERENCES Produkt(id)
);

-- ------------------------------
-- Rezepte und Speisen
CREATE TABLE Speisenart (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	bezeichnung TEXT NOT NULL,
	beschreibung TEXT NOT NULL,
	bildpfad TEXT DEFAULT NULL
);

CREATE TABLE Gericht (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	bezeichnung TEXT NOT NULL,
	speisenartId INTEGER NOT NULL,
	zubereitung TEXT NOT NULL,
	bildpfad TEXT DEFAULT NULL,
	CONSTRAINT fk_Gericht1 FOREIGN KEY (speisenartId) REFERENCES Speisenart(id)
); 

CREATE TABLE Zutat (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	bezeichnung TEXT NOT NULL,
	beschreibung TEXT NOT NULL
);

CREATE TABLE Einheit (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	bezeichnung TEXT NOT NULL
);

CREATE TABLE Zutatenliste (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	gerichtId INTEGER NOT NULL,
	zutatId INTEGER NOT NULL,
	menge REAL NOT NULL DEFAULT 1.0,
	einheitId INTEGER NOT NULL,
	CONSTRAINT fk_Zutatenliste1 FOREIGN KEY (gerichtId) REFERENCES Gericht(id),
	CONSTRAINT fk_Zutatenliste2 FOREIGN KEY (zutatId) REFERENCES Zutat(id),
	CONSTRAINT fk_Zutatenliste3 FOREIGN KEY (einheitId) REFERENCES Einheit(id)
);

CREATE TABLE Bewertung (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	gerichtId INTEGER NOT NULL,
	punkte INTEGER NOT NULL DEFAULT 1,
	zeitpunkt TEXT NOT NULL,
	bemerkung TEXT DEFAULT NULL,
	ersteller TEXT DEFAULT NULL,
	CONSTRAINT fk_Bewertung1 FOREIGN KEY (gerichtId) REFERENCES Gericht(id)
);

-- ------------------------------
-- Forum
CREATE TABLE Benutzerrolle (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	bezeichnung TEXT NOT NULL
);

CREATE TABLE Forumsbenutzer (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	benutzername TEXT NOT NULL,
	geschlecht INTEGER NOT NULL DEFAULT 0,
	geburtstag TEXT NOT NULL,
	beitritt TEXT NOT NULL,
	rolleId INTEGER NOT NULL,
	CONSTRAINT fk_Forumsbenutzer1 FOREIGN KEY (rolleId) REFERENCES Benutzerrolle(id)
);

CREATE TABLE Forumsbereich (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	thema TEXT NOT NULL,
	beschreibung TEXT NOT NULL,
	administratorId INTEGER NOT NULL,
	CONSTRAINT fk_Forumsbereich1 FOREIGN KEY (administratorId) REFERENCES Forumsbenutzer(id)
);

CREATE TABLE Forumseintrag (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	beitrag TEXT NOT NULL,
	erstellerId INTEGER NOT NULL,
	erstellzeitpunkt TEXT NOT NULL,
	bereichsId INTEGER DEFAULT NULL,
	vaterId INTEGER DEFAULT NULL,
	entfernt INTEGER NOT NULL DEFAULT 0,
	CONSTRAINT fk_Forumseintrag1 FOREIGN KEY (erstellerId) REFERENCES Forumsbenutzer(id),
	CONSTRAINT fk_Forumseintrag2 FOREIGN KEY (bereichsId) REFERENCES Forumsbereich(id),
	CONSTRAINT fk_Forumseintrag3 FOREIGN KEY (vaterId) REFERENCES Forumseintrag(id)
);

-- ------------------------------
-- Kinoreservierung
CREATE TABLE Kinosaal (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	bezeichnung TEXT NOT NULL,
	leinwand INTEGER NOT NULL DEFAULT 100,
	tonsystem TEXT NOT NULL,
	projektion TEXT NOT NULL,
	projektionsart INTEGER NOT NULL DEFAULT 0,
	sitzreihen INTEGER NOT NULL DEFAULT 20,
	sitzeProReihe INTEGER NOT NULL DEFAULT 25,
	geschoss TEXT NOT NULL
);

CREATE TABLE Filmgenre (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	bezeichnung TEXT NOT NULL
);

CREATE TABLE Reservierer (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	vorname TEXT NOT NULL,
	nachname TEXT NOT NULL,
	email TEXT NOT NULL
);

CREATE TABLE Film (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	bezeichnung TEXT NOT NULL,
	beschreibung TEXT NOT NULL,
	genreId INTEGER NOT NULL,
	fsk INTEGER NOT NULL DEFAULT 12,
	dauer INTEGER NOT NULL DEFAULT 90,
	regie TEXT NOT NULL,
	darsteller TEXT NOT NULL,
	preis REAL NOT NULL DEFAULT 10.0,
	coverpfad TEXT DEFAULT NULL,
	videopfad TEXT DEFAULT NULL,
	imdb TEXT DEFAULT NULL,
	CONSTRAINT fk_Film1 FOREIGN KEY (genreId) REFERENCES Filmgenre(id)
);

CREATE TABLE Vorstellung (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	filmId INTEGER NOT NULL,
	kinosaalId INTEGER NOT NULL,
	zeitpunkt TEXT NOT NULL,
	CONSTRAINT fk_Vorstellung1 FOREIGN KEY (filmId) REFERENCES Film(id),
	CONSTRAINT fk_Vorstellung2 FOREIGN KEY (kinosaalId) REFERENCES Kinosaal(id)
);

CREATE TABLE Reservierung (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	zeitpunkt NUMERIC NOT NULL,
	reserviererId INTEGER NOT NULL,
	zahlungsartId INTEGER NOT NULL,
	vorstellungId INTEGER NOT NULL,
	CONSTRAINT fk_Reservierung1 FOREIGN KEY (reserviererId) REFERENCES Reservierer(id),
	CONSTRAINT fk_Reservierung2 FOREIGN KEY (zahlungsartId) REFERENCES Zahlungsart(id),
	CONSTRAINT fk_Reservierung3 FOREIGN KEY (vorstellungId) REFERENCES Vorstellung(id)
);

CREATE TABLE ReservierterSitz (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	reservierungId INTEGER NOT NULL,
	reihe INTEGER NOT NULL DEFAULT 1,
	sitzplatz INTEGER NOT NULL DEFAULT 1,
	CONSTRAINT fk_ReservierterSitz1 FOREIGN KEY (reservierungId) REFERENCES Reservierung(id)
);

-- ------------------------------
-- Benutzer
CREATE TABLE Benutzer (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	benutzername TEXT NOT NULL,
	passwort TEXT NOT NULL,
	benutzerrolleId INTEGER NOT NULL,
	personId INTEGER DEFAULT NULL,
	CONSTRAINT fk_Benutzer1 FOREIGN KEY (benutzerrolleId) REFERENCES Benutzerrolle(id),
	CONSTRAINT fk_Benutzer2 FOREIGN KEY (personId) REFERENCES Person(id)
);

-- ------------------------------
-- Galerie
CREATE TABLE Galerie (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	dateigroesse INTEGER NOT NULL DEFAULT 0,
	mimeType TEXT NOT NULL,
	bildpfad TEXT NOT NULL,
	erstellzeitpunkt NUMERIC NOT NULL
);