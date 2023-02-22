const { Octokit } = require("@octokit/rest");

const firebase_owner = "firebase"
const firebase_repository = "firebase-android-sdk"

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

async function run() {
  const today = new Date().toISOString().split('T')[0];
  var yesterday = new Date()
  yesterday = new Date(yesterday.setDate(yesterday.getDate()-1)).toISOString().split('T')[0];

  console.log(`yesterday: ${yesterday}`)
  const query = `is:issue is:open created:${yesterday} repo:${firebase_owner}/${firebase_repository}`;
  var issues = [];

  // get all repositories that were opened for the day
  await octokit.search.issuesAndPullRequests({ q: query })
    .then((response) => {
      issues = response.data.items.filter(issue => !issue.pull_request);
      console.log(`Found ${issues.length} issues opened today in ${firebase_repository}`);
    })
    .catch((error) => {
      console.error(`Error retrieving issues: ${error}`);
    });

  // for each issue that were opened for the day, create a repository
  await issues.forEach(async (issue) => {
    const repositoryName = `issue${issue.number}`
    
    try {
      const existingRepo = await octokit.repos.get({ owner: process.env.MY_USERNAME, repo: repositoryName }).catch(() => null);


      if (!existingRepo) {
        const response = await createAndroidProject(repositoryName)
        console.log(`Created repository ${response.data.name} with URL ${response.data.html_url}`);
      } else {
        console.log(`Repository ${existingRepo.data.name} already exists`);
      }
    } catch (error) {
      console.error(`Error creating repository ${repositoryName}: ${error}`);
    }
  });
}

const owner = "argzdev@gmail.com"
const repositoryOwner = `argz`

async function createAndroidProject(repositoryName) {
  const packageName = `com.${repositoryOwner}.${repositoryName}`

  const response = await octokit.repos.createForAuthenticatedUser({
    name: repositoryName,
    private: true,
  });

  const folderStructure = {
    "app/src/main/AndroidManifest.xml": "\ntest\ntest\ntest\ntest\ntest",
    [`app/src/main/java/${packageName.split(".").join("/")}/MainActivity.java`]: "package " + packageName + ";\n\nimport androidx.appcompat.app.AppCompatActivity;\nimport android.os.Bundle;\n\npublic class MainActivity extends AppCompatActivity {\n    @Override\n    protected void onCreate(Bundle savedInstanceState) {\n        super.onCreate(savedInstanceState);\n        setContentView(R.layout.activity_main);\n    }\n}",
    // "app/src/main/res/layout/activity_main.xml": '<?xml version="1.0" encoding="utf-8"?>\n<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"\n    xmlns:app="http://schemas.android.com/apk/res-auto"\n    xmlns:tools="http://schemas.android.com/tools"\n    android:layout_width="match_parent"\n    android:layout_height="match_parent"\n    tools:context=".MainActivity">\n\n    <TextView\n        android:layout_width="wrap_content"\n        android:layout_height="wrap_content"\n        android:layout_centerInParent="true"\n        android:text="Hello World!" />\n\n</RelativeLayout>\n',
    // "gradle/build.gradle": "plugins {\n    id 'com.android.application'\n}\n\n"
  };

  const tree = await octokit.git.createTree({
    owner: owner,
    repo: repositoryName,
    base_tree: null,
    tree: [
      {
        path: 'app',
        mode: '040000',
        type: 'tree'
      },
      {
        path: 'gradle',
        mode: '040000',
        type: 'tree'
      },
      {
        path: `src/main/java/com/${repositoryOwner}/${repositoryName}`,
        mode: '040000',
        type: 'tree'
      },
      {
        path: 'src/main/res',
        mode: '040000',
        type: 'tree'
      },
      {
        path: 'build.gradle',
        mode: '100644',
        type: 'blob',
        content: 'BUILD_GRADLE_CONTENTS'
      },
      {
        path: 'settings.gradle',
        mode: '100644',
        type: 'blob',
        content: 'SETTINGS_GRADLE_CONTENTS'
      }
    ]
  });
  
  const commit = await octokit.git.createCommit({
    owner: owner,
    repo: repositoryName,
    message: 'Initial commit',
    tree: tree.data.sha,
    parents: [],
  });

  await octokit.git.updateRef({
    owner: owner,
    repo: repositoryName,
    ref: 'heads/master',
    sha: commit.data.sha,
  });



  // // Add the folder and file structure to the repository
  // await Object.keys(folderStructure).forEach(async (path) => {
  //   const content = folderStructure[path];

  //   await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
  //     owner: 'argzdev',
  //     repo: repositoryName,
  //     path: path,
  //     message: 'my commit message',
  //     committer: {
  //       name: 'Argzdev',
  //       email: 'test@github.com'
  //     },
  //     content: Buffer.from(content).toString("base64")
  //   })
  // });

  return response;
}

run();
