# sport-plans

Sporto planų sistema

UŽDUOTIS

Sukurti sistemą, kurioje naudotojai galės dalintis sporto planais, diskutuoti, dalintis sava patirtimi. Sistemos tikslas - supaprastinti sporto treniruočių planavimą, teikti informaciją pagal pasirinktus tikslus ir sporto šakas.

FUNKCINIAI REIKALAVIMAI

1. Naudotojo registracija ir prisijungimas: naudotojai turės galimybę registruotis ir prisijungti, norėdami skelbti savus sporto planus bei dalyvauti diskusijuose.

2. Naudotojo profilis: naudotojai galės redaguoti savo profilį, keisti slaptažodį ar prisijungimo vardą.

3. Sporto planų kūrimas: naudotojai ar patys treneriai galės skelbti savus mytybos planus, kurie apima treniruotes bei pratimus su aprašymais bei komentarais.

4. Sporto planų paieška: naudotojai galės filtruoti sporto planus pagal tipą ar tam tikrus raktažodžius.

5. Sporto planų reitingas: naudotojas galės paspausti patiktuką prie mėgstamo plano, sporto planai bus vaizduojami patiktukų mažėjimo tvarka.

6. Diskusijų skiltis: naudotojai galės dalintis sava patirtimi bei teikti rekomendacijas kitiems.

7. Sporto planų redagavimas: sporto plano kūrėjas turės galimybę planą koreguoti.

8. Patarimai ir rekomendacijos: prie kiekvieno plano bus pateikta informaija, kaip efektyviau atlikti pratymus, kokios yra rizikos.

PASIRINKTOS TECHNOLOGIJOS:

Frontend: React.js

Backend: Express.js

# API Documentation
API documentation for plans, workouts, and exercises.

## Version: 1.0.0

### /exercises

#### POST
##### Summary:

Create a new exercise

##### Responses

| Code | Description |
| ---- | ----------- |
| 201 | Exercise created successfully |
| 400 | All fields are required |
| 422 | Invalid input values |

#### GET
##### Summary:

Get all exercises

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | A list of exercises |

### /exercises/{exercise_id}

#### GET
##### Summary:

Get a specific exercise

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| exercise_id | path | ID of the exercise | Yes | integer |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Exercise found |
| 404 | Exercise not found |

#### PUT
##### Summary:

Update an exercise

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| exercise_id | path | ID of the exercise | Yes | integer |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Exercise updated successfully |
| 400 | All fields are required |
| 404 | Exercise not found |
| 422 | Invalid input values |

#### DELETE
##### Summary:

Delete an exercise

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| exercise_id | path | ID of the exercise | Yes | integer |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Exercise deleted successfully |
| 404 | Exercise not found |

### /plans

#### POST
##### Summary:

Create a new training plan

##### Responses

| Code | Description |
| ---- | ----------- |
| 201 | Plan created successfully |
| 400 | All fields are required title, length, coach, description. |
| 422 | Length must be a positive number. |

#### GET
##### Summary:

Retrieve a list of training plans

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | A list of training plans |

### /plans/{id}

#### GET
##### Summary:

Retrieve a specific training plan by ID

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| id | path | ID of the training plan | Yes | integer |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | A training plan found |
| 404 | Plan not found |

#### PUT
##### Summary:

Update a specific training plan

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| id | path | ID of the training plan | Yes | integer |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Plan updated successfully |
| 404 | Plan not found |

#### DELETE
##### Summary:

Delete a specific training plan

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| id | path | ID of the training plan | Yes | integer |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Plan deleted successfully |
| 404 | Plan not found |

### /plans/{plan_id}/workouts

#### GET
##### Summary:

Retrieve all workouts for a specific training plan

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| plan_id | path | ID of the training plan | Yes | integer |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | A list of workouts for the specified plan |
| 404 | Plan not found |

### /workouts

#### GET
##### Summary:

Retrieve a list of all workouts

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | A list of workouts |

#### POST
##### Summary:

Create a new workout for a specific training plan

##### Responses

| Code | Description |
| ---- | ----------- |
| 201 | Workout created successfully |
| 400 | Invalid payload. All fields are required. |
| 422 | Invalid payload. Length and frequency must be positive numbers. |

### /workouts/{workout_id}

#### GET
##### Summary:

Retrieve a specific workout by ID

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| workout_id | path | ID of the workout | Yes | integer |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | A workout found |
| 404 | Workout not found |

#### PUT
##### Summary:

Update a specific workout

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| workout_id | path | ID of the workout | Yes | integer |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Workout updated successfully |
| 400 | Invalid payload. All fields are required. |
| 404 | Workout not found |
| 422 | Invalid payload. Length and frequency must be positive numbers. |

#### DELETE
##### Summary:

Delete a specific workout

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| workout_id | path | ID of the workout | Yes | integer |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Workout deleted successfully |
| 404 | Workout not found |
