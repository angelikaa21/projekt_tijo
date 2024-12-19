# Manual Test Cases

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


