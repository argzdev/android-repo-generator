# Issue project generator
### Prerequisite
- Add a secret `MY_USERNAME` - this is your account username.
- Add a secret `MY_TOKEN` - this is your Personal access token with `repo` permission.
### Summary
- On every push/pull request sa project, it scans the `firebase-android-sdk` for opened issues for the day. For every issue scanned, it will generate a android repository with firebase dependency to your github account.

1. `issue_project_generator_workflow.yml` -> Github action that runs on push/pull request which runs `issue_project_generator.js`
2. `issue_project_generator.js` -> Get issues for the day in `firebase-android-sdk` and use `android_file_generator.js`
3. `android_file_generator.js` -> For each issue, this will generate a commit tree that have an android project template

