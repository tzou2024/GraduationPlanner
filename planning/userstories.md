# Description

Graduation Planner is an app designed to help college students keep on track with graduation and credit/class requirements in accordance with their major. Users can input information about the classes they take each semester and get informatin about what they are missing/still need to graduate.

The vision for this project is ccreating something that I would actually benefit from using right now. I want to design it with my school in mind. The dream end-goal would be being able to have an admin continuously add courses and all of their information each semester, so students can log on, select their class/semester, and view everything they need to know.


# MVP
Students input all classes

## Students Should Be Able To...
<ul>
  <li>Login In</li>
  <li>Choose their major</li>
  <li>Create/Edit/Delete Classes on their Schedule</li>
</ul>

## Pages

### Login Page
Students should be able to create an account with username and password, and select their major from this page

### Main Page / Course Schedule
This page should be a semester-by-semester schedule with the names of classes students have taken/plan to take listed out. Users should also be able to add a class from this page, or edit/delete a class from this page.

### CRUDable Classes
This page should have information about a singular class with RESTful routing.

| Name     | Path | HTTP | Purpose |
|----------|------|------|---------|
| Index    | classes | GET | Displayes all classes | 
| New     | classes/new   | GET | Shows form for creating new class | 
| Create  | classes       | POST| Creates a new class |
| Show    | classes/:id   | GET | Shows one specified class |
| Edit    | class/:id?edit|GET  | Shows edit form for one class |
| Update  | class/:id     | PUT | Updates a Class | 
| Destroy | class/:id     | DELETE | Deletes a class |


### General Credit Breakdown 
This page should show information about the total credit requirments for ENG, SCI, ect. and how much they need to take/how much they have left to do as part of general graudation requirements.

### Question: 

### Major-Specific Breakdown
This page shoud be some sort of checker to see whether the student is satysfying all of the required courses for their specific major.


## Model

### Class

| Key     | Value |
| ----------- | ----------- |
| Name      | String       |
| Place   | String       |
| Semester   | Number       |
| Credits  | Number        |
| Category  | TBD  |
| Done  | Boolean  |


### Major Requirements
| Key     | Value |
| ----------- | ----------- |
| Name     | String |
|    Required Classes   | List?   |
|    Electives  | List?   |

### Users

| Key     | Value |
| ----------- | ----------- |
| Username   | String    |
| Password | String |
| Plan | Object Array | 

### Plan Subchema



## Stretch Goals

<ul>
    <li>Have it so administrators can add available classes so all students have to do is pick class names (Although This is kind of a functionality change)</li>
    <li>Incorperate Intra-Semester Scheduling with class times and a weekly scheduler</li>
</ul>
