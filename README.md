# Testowanie i Jakość Oprogramowania

## Autor
Angelika Król

## Temat projektu
Baza filmowa

## Opis projektu
Projekt to aplikacja webowa umożliwiająca użytkownikom:
- Przeglądanie szczegółowych informacji o filmach.
- Ocenianie filmów, tworzenie list ulubionych filmów i zapisywanie do obejrzenia.

Aplikacja wykorzystuje API TMDB do pobierania danych o filmach oraz MongoDB do przechowywania danych użytkowników.

## Uruchamianie projektu
1. Sklonuj repozytorium:
   ```bash
   git clone https://github.com/angelikaa21/projekt_tijo.git
   ```
2. Przejdź do katalogu projektu i zainstaluj zależności:
   ```bash
   cd client
   npm install
   ```
3. Zainstaluj zależności backendu:
   ```bash
   cd server
   npm install
   ```
4. Uruchom backend:
   ```bash
   cd server
   npm run dev
   ```
5. Uruchom frontend:
   ```bash
   cd client
   npm start
   ```
   
## Testy
### Testy jednostkowe i integracyjne
Pliki testowe znajdują się na GitHubie w poniższych lokalizacjach:

- [LoginRegisterTest.test.js](client/src/tests/LoginRegisterTest.test.js): Testy komponentów logowania i rejestracji.
- [tmdbApi.test.js](client/src/tests/tmdbApi.test.js): Testy integracyjne dla funkcji API TMDB.

#### Przykładowe uruchomienie testów:
```bash
npm test
```

### Zakres testów:
1. **LoginRegisterTest.test.js**
   - Testowanie poprawnego renderowania formularzy logowania i rejestracji.
   - Walidacja danych wejściowych.
   - Sprawdzenie wywołań funkcji API `registerUser` i `loginUser`.

2. **tmdbApi.test.js**
   - Pobieranie listy filmów trendujących.
   - Pobieranie szczegółowych informacji o filmie.
   - Obsługa błędów API.

## Dokumentacja API
https://app.swaggerhub.com/apis-docs/AngelikaKrol/movie-app_api/1.0.0

## Przypadki testowe dla testera manualnego
### Manual Test Cases

| ID    | Opis testu                                 | Kroki do wykonania                                                                 | Oczekiwany rezultat                           |
|-------|--------------------------------------------|------------------------------------------------------------------------------------|-----------------------------------------------|
| TC01  | Logowanie z poprawnymi danymi              | 1. Otwórz stronę logowania.                                                        | Użytkownik zostaje zalogowany.                |
|       |                                            | 2. Wprowadź poprawny login i hasło.                                                |                                               |
|       |                                            | 3. Kliknij przycisk "Login".                                                       |                                               |
| TC02  | Logowanie z niepoprawnym hasłem            | 1. Otwórz stronę logowania.                                                        | Pojawia się komunikat "Login error".          |
|       |                                            | 2. Wprowadź poprawny login i błędne hasło.                                         |                                               |
|       |                                            | 3. Kliknij przycisk "Zaloguj".                                                     |                                               |
| TC03  | Rejestracja nowego użytkownika             | 1. Kliknij przycisk logowania.                                                     | Użytkownik zostaje zarejestrowany.            |
|       |                                            | 2. Przejdź do okienka rejestracji klikając "Register here"                         |                                               |
|       |                                            | 2. Wprowadź poprawne dane (username, email, password).                             |                                               |
|       |                                            | 3. Kliknij przycisk "Register".                                                    |                                               |
| TC04  | Weryfikacja wyświetlania komunikatu błędu  | 1. Kliknij przycisk logowania.                                                     | Pojawia się komunikat "Wypełnij to pole".     |
|       | przy pustym polu loginu                    | 2. Zostaw pole login puste.                                                        |                                               |
|       |                                            | 3. Wprowadź hasło.                                                                 |                                               |
|       |                                            | 4. Kliknij przycisk "Login".                                                       |                                               |
| TC05  | Wylogowanie użytkownika                    | 1. Zaloguj się na swoje konto.                                                     | Użytkownik zostaje wylogowany.                |
|       |                                            | 2. Kliknij przycisk "Logout".                                                      |                                               |
| TC06  |Dodanie oceny                               | 1. Zaloguj się na swoje konto.                                                     | Film zostaje oceniony.                        |
|       |                                            | 2. Otwórz szczegóły wybranego filmu.                                               |                                               |
|       |                                            | 3. Kliknij przycisk "Rate".                                                        |                                               |
|       |                                            | 4. Zaznacz ilość gwiazdek i kliknij przycisk "Confirm"                             |                                               |
| TC07  | Dodanie filmu do ulubionych                | 1. Zaloguj się na swoje konto.                                                     | Film zostaje dodany do listy ulubionych.      |
|       |                                            | 2. Otwórz szczegóły wybranego filmu.                                               |                                               |
|       |                                            | 3. Kliknij przycisk "Like".                                                        |                                               |
| TC08  | Wyszukiwanie filmu                         | 1. Wpisz nazwę filmu w wyszukiwarce.                                               | Wyświetlają się szczegóły znalezionego filmu  |
|       |                                            | 2. Wybierz film z listy wyników                                                    |                                               |
| TC09  | Filtrowanie filmów                         | 1. Rozwiń listę klikając w "Menu".                                                 | Wyświetlają się tytuły spełniające kryteria.  |
|       |                                            | 2. Przejdź na podstronę z filmami.                                                 |                                               |
|       |                                            | 3. Wybierz kryteria filtrowania.                                                   |                                               |
| TC10  | Przejście do szczegółów filmu              | 1. Wybierz dowolny film z listy.                                                   | Wyświetlają się szczegóły filmu.              |
|       |                                            | 2. Kliknij w obrazek lub przycisk "Więcej szczegółów".                             |                                               |


## Technologie użyte w projekcie
- **Frontend:** React.js, React Slick
- **Backend:** Node.js, Express.js
- **Baza danych:** MongoDB


