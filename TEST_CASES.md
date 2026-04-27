## Test Data

These tests assume a predefined test account is used.

Test account:
- Email: <TEST_EMAIL>
- Password: <TEST_PASSWORD>

The Register flow is excluded from regular regression testing.


# Manual Test Cases

---

## Authentication

Test case: Login with valid credentials

Preconditions:
- User is logged out
- A test account exists with known email and password

Description:
1. Open the Login page (`/login`)
2. Enter the test account email
3. Enter the correct password
4. Click the "Log in" button
5. Verify the page redirects to the Home page (`/`)
6. Verify the dashboard section is visible with a welcome message

Expected:
- User is redirected to the Home page
- The logged-in dashboard section is visible
- No error message is shown

---

Test case: Login with invalid credentials

Preconditions:
- User is logged out

Description:
1. Open the Login page (`/login`)
2. Enter a valid email but an incorrect password
3. Click the "Log in" button
4. Verify an error message appears below the form

Expected:
- An error message is displayed (e.g., "Invalid login credentials")
- User remains on the Login page
- No redirect occurs

---

Test case: Logout

Preconditions:
- User is logged in

Description:
1. Click the "Logout" button in the navbar
2. Verify the page redirects to the Login page
3. Try navigating to `/family` manually
4. Verify the user is redirected back to Login

Expected:
- User is logged out and redirected to the Login page
- Protected routes are no longer accessible

---

Test case: Access protected route while logged out

Preconditions:
- User is logged out

Description:
1. Manually type `/family` in the browser address bar and press Enter
2. Verify the page redirects to Login
3. Repeat for `/stats`, `/history`, and `/templates`

Expected:
- Each protected route redirects to the Login page
- No protected content is shown

---

Test case: Refresh protected page while logged in

Preconditions:
- User is logged in

Description:
1. Navigate to the Family page (`/family`)
2. Refresh the browser (F5 or Cmd+R)
3. Verify the user stays on the Family page

Expected:
- User remains on the Family page after refresh
- No redirect to Login occurs
- Page content loads correctly

---

## Home Page

Test case: Home page for logged-out user

Preconditions:
- User is logged out

Description:
1. Open the app at the Home page (`/`)
2. Verify the hero section is visible
3. Verify the "How it works" section is visible
4. Verify no dashboard or welcome section is shown

Expected:
- Hero section and "How it works" section are both visible
- Dashboard section is not rendered

---

Test case: Home page for logged-in user

Preconditions:
- User is logged in

Description:
1. Navigate to the Home page (`/`)
2. Verify the hero section is visible at the top
3. Verify the dashboard panel is visible below the hero
4. Verify the dashboard shows a welcome message and stat cards
5. Verify the "How it works" section is visible below the dashboard

Expected:
- All three sections are visible: hero, dashboard, "How it works"
- Dashboard shows the correct username from the logged-in account
- Stat cards are displayed (Family Members, Active Tasks, Completed, Missed, Productivity)

---

Test case: Toggle dark and light mode

Preconditions:
- User is on any page

Description:
1. Click the theme toggle button in the navbar
2. Verify the page switches between dark and light mode
3. Refresh the browser
4. Verify the selected theme is still active

Expected:
- Theme switches immediately upon clicking the toggle
- Theme preference persists after page refresh

---

## Family Members

Test case: Add a family member

Preconditions:
- User is logged in
- User is on the Family page (`/family`)

Description:
1. Click the "+ Add Member" button
2. Enter a name for the new member
3. Select a role (e.g., Parent or Child)
4. Select an avatar color
5. Click "Save" or confirm the form
6. Verify the new member card appears in the list

Expected:
- New member appears on the Family page immediately
- Member data is saved to Supabase and persists after refresh

---

Test case: Edit a family member

Preconditions:
- User is logged in
- At least one family member exists

Description:
1. Open the Family page (`/family`)
2. Click the "Edit" button on a member card
3. Change the member's name or role
4. Save the changes
5. Verify the updated name or role appears on the card

Expected:
- Updated details are visible immediately on the member card
- Changes persist after refreshing the page

---

Test case: Delete a family member

Preconditions:
- User is logged in
- At least one family member exists

Description:
1. Open the Family page (`/family`)
2. Click the "Delete" button on a member card
3. Confirm the deletion in the confirmation dialog
4. Verify the member is no longer shown in the list

Expected:
- Member is removed from the list immediately
- Member data is deleted from Supabase
- Member does not reappear after page refresh

---

Test case: Open a member page

Preconditions:
- User is logged in
- At least one family member exists

Description:
1. Open the Family page (`/family`)
2. Click on a family member card (not on Edit or Delete)
3. Verify the MemberPage opens for that specific member
4. Verify the member's name appears in the page heading

Expected:
- MemberPage (`/family/:memberId`) loads correctly
- Page header displays the correct member's name

---

Test case: Navigate back to Family from MemberPage

Preconditions:
- User is logged in
- User is on a MemberPage

Description:
1. Click the "← Back to Family" link at the top of the MemberPage
2. Verify the user is returned to the Family page

Expected:
- User is navigated back to `/family`
- Family member list is visible

---

## Tasks

Test case: Add a manual daily task

Preconditions:
- User is logged in
- At least one family member exists
- User is on the MemberPage, Daily tab selected

Description:
1. Open the MemberPage for a family member
2. Make sure the Daily tab is active
3. Navigate to today's date using the calendar
4. Click the "+ Add Task" button
5. Enter a task title and optionally a description
6. Save the task
7. Verify the task appears in the "To Do" column

Expected:
- Task appears in the To Do column on the current day's board
- Task is saved to Supabase and visible after page refresh

---

Test case: Edit a task

Preconditions:
- User is logged in
- At least one task exists on a member's board

Description:
1. Open the MemberPage for a member that has a task
2. Click on the task to open its detail modal
3. Update the task title or description
4. Save the changes
5. Verify the updated text appears on the task card

Expected:
- Updated task details are visible immediately
- Changes persist after refreshing the page

---

Test case: Delete a task

Preconditions:
- User is logged in
- At least one task exists on a member's board

Description:
1. Open the MemberPage for a member that has a task
2. Click the delete button on the task card or inside the task modal
3. Confirm the deletion in the confirmation dialog
4. Verify the task is no longer shown on the board

Expected:
- Task is removed from the board immediately
- Task is deleted from Supabase and does not reappear after refresh

---

Test case: Move task to In Progress

Preconditions:
- User is logged in
- At least one task exists in the To Do column

Description:
1. Open the MemberPage and locate a task in the To Do column
2. Drag the task card into the In Progress column
3. Verify the task appears in In Progress
4. Refresh the page and verify the task is still in In Progress

Expected:
- Task status updates to "in_progress" immediately
- Status change persists after page refresh

---

Test case: Move task to Done

Preconditions:
- User is logged in
- At least one task exists in To Do or In Progress

Description:
1. Open the MemberPage and locate a task in the To Do or In Progress column
2. Drag the task card into the Done column
3. Verify the task appears in the Done column
4. Refresh the page and verify the task is still in Done

Expected:
- Task status updates to "done" immediately
- `completed_at` timestamp is stored in Supabase
- Status persists after page refresh

---

Test case: Move task out of Done

Preconditions:
- User is logged in
- At least one task exists in the Done column

Description:
1. Open the MemberPage and locate a task in the Done column
2. Drag the task back to the To Do or In Progress column
3. Verify the task appears in the target column
4. Refresh the page and verify the status is correct

Expected:
- Task status updates correctly (back to "todo" or "in_progress")
- `completed_at` is cleared in Supabase
- Status persists after page refresh

---

Test case: Add a comment to a task

Preconditions:
- User is logged in
- At least one task exists on a member's board

Description:
1. Open the MemberPage and click on a task to open its detail modal
2. Find the comment input field
3. Type a comment and submit it
4. Verify the comment appears in the comments list within the modal
5. Close the modal, reopen the task
6. Verify the comment is still visible

Expected:
- Comment appears immediately after submitting
- Comment persists after closing and reopening the task modal

---

## Templates

Test case: Add a daily template

Preconditions:
- User is logged in
- At least one family member exists
- User is on the Templates page (`/templates`)

Description:
1. Open the Templates page
2. Select a family member from the member selector
3. Click "+ Add Template" (or equivalent) in the Daily section
4. Enter a template title
5. Save the template
6. Verify the template appears in the Daily templates list

Expected:
- Template is visible in the Daily section immediately
- Template is saved to Supabase and persists after page refresh

---

Test case: Add a weekly template

Preconditions:
- User is logged in
- At least one family member exists
- User is on the Templates page

Description:
1. Open the Templates page
2. Select a family member
3. Add a new template in the Weekly section
4. Save the template
5. Verify the template appears in the Weekly section

Expected:
- Template appears in the Weekly section
- Persists after page refresh

---

Test case: Add a monthly template

Preconditions:
- User is logged in
- At least one family member exists
- User is on the Templates page

Description:
1. Open the Templates page
2. Select a family member
3. Add a new template in the Monthly section
4. Save the template
5. Verify the template appears in the Monthly section

Expected:
- Template appears in the Monthly section
- Persists after page refresh

---

Test case: Template tasks are auto-generated when viewing a period

Preconditions:
- User is logged in
- At least one daily (or weekly or monthly) template exists for a family member
- No tasks have been generated yet for the current period

Description:
1. Open the MemberPage for the member that has templates
2. Select the tab matching the template type (e.g., Daily)
3. Navigate to the current period (today, current week, or current month)
4. Verify tasks are automatically generated from the templates
5. Verify each generated task appears in the To Do column

Expected:
- Tasks are generated automatically without any manual action
- Each generated task corresponds to an existing template
- Tasks have `isGenerated: true` and are linked to the template via `sourceTemplateId`

---

Test case: No duplicate tasks are generated

Preconditions:
- User is logged in
- Template tasks have already been generated for the current period

Description:
1. Open the MemberPage for the member
2. Navigate away to another page
3. Return to the MemberPage and select the same period tab
4. Refresh the page and revisit the same period
5. Verify no duplicate tasks appear

Expected:
- No duplicate tasks are created for the same template and period
- Task count remains the same after multiple visits or refreshes

---

## Missed Tasks

Test case: Unfinished task from a past period is shown as missed

Preconditions:
- User is logged in
- A daily (or weekly or monthly) task exists in a past period with status other than "done"

Description:
1. Open the MemberPage for a member that has an unfinished task in a past period
2. Navigate to the past period using the period selector
3. Verify the task is visually marked as missed (e.g., highlighted or labeled)

Expected:
- The task is displayed with a missed indicator
- The task is not shown as active or completed

---

Test case: Completed task from a past period is not marked as missed

Preconditions:
- User is logged in
- A task exists in a past period with status "done"

Description:
1. Open the MemberPage and navigate to a past period that has a completed task
2. Verify the task is shown in the Done column or with a completed state
3. Verify the task does not have a missed indicator

Expected:
- Completed tasks are never marked as missed regardless of the period

---

## History

Test case: View task history for a past period

Preconditions:
- User is logged in
- Tasks exist for at least one past period

Description:
1. Open the History page (`/history`)
2. Select the Day, Week, or Month mode
3. Navigate to a past period that has tasks
4. Verify tasks are displayed as a timeline or activity feed

Expected:
- Tasks for the selected period are displayed
- Each task shows its title, status, and relevant period information

---

Test case: Switch between Day, Week, and Month modes in History

Preconditions:
- User is logged in
- User is on the History page

Description:
1. Open the History page
2. Click the "Day" tab and verify the calendar is shown
3. Click the "Week" tab and verify the week navigator is shown
4. Click the "Month" tab and verify the month navigator is shown
5. Navigate to a period in each mode and verify data updates accordingly

Expected:
- Each mode shows the correct navigator control
- Displayed tasks match the selected period type after switching

---

## Stats

Test case: View stats for all family members

Preconditions:
- User is logged in
- At least one family member exists

Description:
1. Open the Stats page (`/stats`)
2. Verify each family member is listed
3. Verify each member shows task completion data

Expected:
- All family members are displayed on the Stats page
- Each member shows at least a completion percentage or task count

---

Test case: View productivity score for a member

Preconditions:
- User is logged in
- At least one family member has tasks recorded

Description:
1. Open the Stats page
2. Click on a family member to open their detailed stats page
3. Verify a productivity or completion percentage is displayed
4. Verify a progress bar is visible

Expected:
- Productivity score is shown as a percentage
- A progress bar reflects the percentage value

---

## Persistence

Test case: Task data persists after page refresh

Preconditions:
- User is logged in
- A task was recently added to a member's board

Description:
1. Note the task title and its current column (e.g., To Do)
2. Refresh the browser
3. Navigate back to the same MemberPage and period
4. Verify the task is still visible in the same column

Expected:
- Task is present after refresh
- Task status has not changed
- No duplicate tasks appear

---

Test case: Data loads correctly when logging in from a different browser

Preconditions:
- Test account has existing family members and tasks saved in Supabase
- User is logged out in a fresh browser or incognito window

Description:
1. Open the app in a different browser or an incognito/private window
2. Log in with the test account credentials
3. Navigate to the Family page and verify members are shown
4. Navigate to a MemberPage and verify tasks are loaded

Expected:
- All family members and tasks load correctly from Supabase
- Data matches what was entered previously

---

## UI

Test case: Navbar links navigate to correct pages

Preconditions:
- User is logged in

Description:
1. Click "Family" in the navbar — verify the Family page loads
2. Click "Templates" in the navbar — verify the Templates page loads
3. Click "History" in the navbar — verify the History page loads
4. Click "Stats" in the navbar — verify the Stats page loads
5. Click the app logo or home link — verify the Home page loads

Expected:
- Each navbar link navigates to the correct page
- No broken links or error pages

---

Test case: Layout is usable on a small screen

Preconditions:
- User is logged in

Description:
1. Open the browser DevTools and set the viewport to a mobile width (e.g., 375px)
2. Open the Home page and verify content is readable and not overflowing
3. Open the Family page and verify member cards are visible
4. Open the MemberPage and verify the task board is scrollable and usable
5. Open the navbar and verify navigation is accessible

Expected:
- All pages are readable and functional at mobile width
- No content overflows the viewport
- Key actions (add task, navigate, etc.) remain accessible
