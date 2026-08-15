# Foto-admin gebruiken

De admin-pagina (`admin.html`) staat **bewust niet online**. Ze is uitgesloten
van de publicatie via `.vercelignore`, zodat niemand er via internet bij kan.

Dat is veiliger dan een wachtwoord: de site is statisch (er is geen server), dus
een wachtwoordcontrole zou in de browser draaien en gewoon leesbaar zijn in de
broncode van de pagina.

## Zo open je de admin

Dubbelklik `admin.html` in de map `Project Portfolio`. Ze opent in je browser en
werkt volledig.

**Wil je je aanpassingen ook meteen live zien op de site?** Start dan even een
lokale server, zodat de admin en de site dezelfde browseropslag delen:

```bash
python -m http.server 8000
```

Ga daarna naar:

- admin: http://localhost:8000/admin.html
- site: http://localhost:8000/index.html

Stop de server met `Ctrl+C`.

## Aanpassingen definitief maken

Bewerkingen worden opgeslagen in **jouw browser**. Om ze voor iedereen zichtbaar
te maken:

1. Klik **Export photos.js ↓** in de admin.
2. Vervang het bestand `js/photos.js` door het gedownloade bestand.
3. Zet de wijziging online:

```bash
git add -A && git commit -m "Nieuwe foto's" && git push
```

Nieuwe afbeeldingsbestanden moeten altijd zelf in de map `images/` gezet worden.
