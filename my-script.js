const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

async function run() {
    try {
        await createAndroidProject()
    } catch (error) {
        console.error(`Error creating repository ${repositoryName}: ${error}`);
    }
}

run();

const projectStructure = {
    'app': {
      'src': {
        'main': {
          'java': {
            'com': {
              'example': {
                'myapplication': {
                  'MainActivity.java': 'public class MainActivity {}'
                }
              }
            }
          },
          'res': {
            'layout': {
              'activity_main.xml': '<?xml version="1.0" encoding="utf-8"?><androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android" xmlns:app="http://schemas.android.com/apk/res-auto" xmlns:tools="http://schemas.android.com/tools" android:layout_width="match_parent" android:layout_height="match_parent" tools:context=".MainActivity"><TextView android:layout_width="wrap_content" android:layout_height="wrap_content" android:text="Hello, World!" app:layout_constraintBottom_toBottomOf="parent" app:layout_constraintLeft_toLeftOf="parent" app:layout_constraintRight_toRightOf="parent" app:layout_constraintTop_toTopOf="parent" /></androidx.constraintlayout.widget.ConstraintLayout>'
            }
          }
        }
      }
    }
};
const owner = 'argzdev';
const repo = 'issue_test_1';
  
async function createAndroidProject() {
    const tree = await createGitTree(projectStructure);
    const branchRef = await createBranch(tree.sha);
    console.log(`Created new branch ${branchRef.data.ref}`);
    await updateBranch(branchRef.data.object.sha);
}

async function createGitTree(files) {
    const gitTree = [];
    for (let [fileName, contents] of Object.entries(files)) {
      const fileStat = fs.statSync(fileName);
      if (fileStat.isDirectory()) {
        const subtree = await createGitTree(contents);
        gitTree.push({
          path: fileName,
          mode: '040000',
          type: 'tree',
          sha: subtree.sha
        });
      } else {
        if (!fileName.endsWith('.gradle') && !fileName.endsWith('.gradle.kts')) { // exclude gradle plugin files
          gitTree.push({
            path: fileName,
            mode: '100644',
            type: 'blob',
            content: contents
          });
        }
      }
    }
    const { data: { sha } } = await octokit.git.createTree({
      owner,
      repo,
      tree: gitTree
    });
    return { sha };
  }
  
  async function createBranch(treeSha) {
    return await octokit.git.createRef({
      owner,
      repo,
      ref: 'refs/heads/new-branch',
      sha: treeSha
    });
  }
  
  async function updateBranch(newTreeSha) {
    const { data: { sha } } = await octokit.git.getRef({
      owner,
      repo,
      ref: 'heads/master'
    });
    return await octokit.git.updateRef({
      owner,
      repo,
      ref: 'heads/new-branch',
      sha,
      force: true
    });
  }