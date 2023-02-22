const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

async function run() {
    const repositoryName = "issue_testing_1"
    const REPOSITORY_OWNER = "argzdev"

    try {
        await createAndroidProject(repositoryName, REPOSITORY_OWNER)
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

  
async function createAndroidProject(repositoryName, repositoryOwner) {

    const owner = repositoryOwner;
    const repo = repositoryName;
    const content = 'Hello, World!';

    octokit.repos.createForAuthenticatedUser({
        name: repo
      }).then(response => {
        const repoUrl = response.data.html_url;
        console.log('Repository URL:', repoUrl);
      
        // Create a new file in the repository
        return octokit.repos.createOrUpdateFileContents({
          owner: owner,
          repo: repo,
          path: 'tests.txt',
          message: 'Add tests.txt',
          content: Buffer.from(content).toString('base64')
        });
      }).then(response => {
        const commitSha = response.data.commit.sha;
        console.log('Commit SHA:', commitSha);
      
        const tree = [
            {
                path: 'hello.txt',
                mode: '100644',
                sha: response.data.content.sha
            },
            {
                path: 'app',
                mode: '040000',
                type: 'tree',
                sha: response.data.content.sha
              },
              {
                path: 'gradle',
                mode: '040000',
                type: 'tree',
                sha: response.data.content.sha
              },
        ];
      
        // Get the SHA for the HEAD commit of the master branch
        return octokit.git.getRef({
          owner: owner,
          repo: repo,
          ref: 'heads/main'
        }).then(response => {
          const baseTreeSha = response.data.object.sha;
          console.log('base Tree SHA:', baseTreeSha);
      
          // Create a new Git tree with the specified content
          return octokit.git.createTree({
            owner: owner,
            repo: repo,
            base_tree: baseTreeSha,
            tree: tree
          });
        });
      }).then(response => {
        const treeSha = response.data.sha;
        console.log('Tree SHA:', treeSha);
      }).catch(error => {
        console.log('Error:', error);
      });
}