# GraduationPlanner

This is a baseline graduation requirement scheduler built for my College, with a CRUDable course catalog, user schedule, and visualizations for what classes/credits a student needs to fulfill to graduate in accordance with their major.

## Technology Used:
Express, node, bcrypt, dotenv, liquid, lodash, mongoose, superkube CSS, deployed with Heroku

## Approach Taken:
I started with wireframes and user stories, trying to get an idea of what features I wanted. Then, I made a schema for classes and filled out the catalogue routes, the schedule, and the credits tab with limited seed data. I finally made a major schema and filled out the major requirements tab. Because majors are complicated and all have different types/requirements/categories, I made the schema loose and accommodated for the personalization of majors. I finally added more seed data.

For a proof of concept, I think my app's functionality is pretty good, and I feel like I have set things up with schema independent of each other for separation of concerns. I also think that the project is scalable with more seed classes/majors, and I wouldn't need to make any core changes. It's also much more clean and modern than most other universities' graduation tools (if they even have one), and I'm happy I chose a project that I can/will use in real life.

## Unsolved Problems:
I didn't get to any of my stretch goals and I feel like my schemas are more complicated than they probably should be but overall I got a lot of the base functionality I was looking for. In terms of actual usability in the real world I don't have:

<ul>
    <li>Login Page notifications (if password incorrect ect)</li>
    <li>The schedule changes size and the edit and delete formatting looks weird</li>
    <li>No input validation/salination</li>
    <li>Can only add classes that satisfy your major's fulfillment categories</li>
    <li>Anyone can edit the class catalogue, and classes can only fulfill one category or are counted as additional classes in major requirements</li>
    <li>No functionality for semester offered ect.</li>
</ul>