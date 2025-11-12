### 1. Namn och kontaktuppgifter
**Personuppgiftsansvarig:**
Projektgruppen GameMarket inom kursen Software Life Cycle Management

**Kontaktpersoner:**
- Jacob Rennemark – jacob.rennemark@iths.se
- Alexander Gallorini – alexander.gallorini@iths.se
- Filip Kostić – filip.kostic@iths.se

**Dataskyddsombud:**
Ingen (studentprojekt)

### 2. Ändamål med behandlingen
Syftet med behandlingen av personuppgifter är att möjliggöra följande funktioner i applikationen:
- Skapa och hantera användarkonton
- Köpa eller hyra spel via plattformen
- Visa användarens egna listningar, order och önskelistor
- Uppfylla GDPR-krav såsom åtkomst, ändring och radering av personuppgifter

### 3. Kategorier av registrerade och personuppgifter

|**Kategori av registrerade**|**Kategorier av personuppgifter**|**Beskrivning av behandling**|
|---|---|---|
|Registrerade användare|Användarnamn, e-post, lösenord (hashat), roll (user/admin)|Lagring för inloggning och kontohantering|
|Säljare/Köpare|Namn, e-post, spel, priser, transaktionsdata|Hantering av köp och uthyrning|

### 4. Mottagare av uppgifterna
- Endast systemets databas (PostgreSQL) och applikationens backend har åtkomst till uppgifterna.
- Ingen överföring till tredje part eller externa tjänster sker.

### 5. Överföringar till tredjeland eller internationell organisation
- Inga personuppgifter överförs till tredjeland eller internationella organisationer.
- All data hanteras inom EU (Azure-miljö).

### 6. Tidsfrister för radering

|**Typ av uppgift**|**Raderingspolicy**|
|---|---|
|Användarkonto|Raderas om användaren väljer att ta bort sitt konto via profilsidan|
|Orderhistorik|Raderas automatiskt när kopplat användarkonto tas bort|
|Lösenord|Hashade värden raderas tillsammans med användarkontot|
|Önskelistor / listningar|Raderas tillsammans med användaren|

### 7. Tekniska och organisatoriska säkerhetsåtgärder
- Lösenord lagras med bcrypt-hashning
- Kommunikation mellan frontend och backend sker via HTTPS (produktion)
- Endast autentiserade användare kan nå skyddade API-endpoints
- Databasen körs i en isolerad Docker-container med volym för persistens
- Åtkomst till servern är begränsad till gruppens medlemmar
- JWT används för sessionshantering, och tokens har tidsbegränsad giltighet