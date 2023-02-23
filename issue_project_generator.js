const { Octokit } = require("@octokit/rest");
const { createAndroidProject } = require("./android_file_generator");

const REPOSITORY_OWNER = "argzdev" // process.env.MY_USERNAME
const TOKEN = "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" // process.env.GITHUB_TOKEN

const today = new Date().toISOString().split('T')[0];
const FIREBASE_OWNER = "firebase"
const FIREBASE_REPOSITORY = "firebase-android-sdk"
const QUERY_DATE = today

const octokit = new Octokit({
  auth: TOKEN
})

async function run() {

    // Retrieve all issues that were opened for the day for the said repository
    const query = `is:issue is:open created:${QUERY_DATE} repo:${FIREBASE_OWNER}/${FIREBASE_REPOSITORY}`;
    var issues = await getAllIssuesFromRepo(query)

    // Create a repository for each issue that were opened
    await issues.forEach(async (issue) => {
        const repositoryName = `issue${issue.number}`
        const repositoryTitle = issue.title
        
        if(await repoExists(repositoryName)) {
            console.log(`Repository ${repositoryName} already exists`);
            return
        }

        try {
            const response = await createRepository(repositoryName, REPOSITORY_OWNER, repositoryTitle)
            console.log(`Created repository ${response.full_name} with URL ${response.html_url}`);
        } catch (error) {
            console.error(`Error creating repository ${repositoryName}: ${error}`);
        }
    });
}

async function getAllIssuesFromRepo(query) {
    return await octokit.search.issuesAndPullRequests({ q: query })
        .then((response) => { return response.data.items.filter(issue => !issue.pull_request) })
        .catch((error) => console.error(`Error retrieving issues: ${error}`));
}

async function repoExists(repositoryName){
    const existingRepo = await octokit.repos.get({ owner: REPOSITORY_OWNER, repo: repositoryName }).catch(() => null);
    if(existingRepo) { return true } else { return false }
}

async function createRepository(repositoryName, repositoryOwner, repositoryTitle) {
    // Step 1 create repository
    const { data: repository } = await octokit.repos.createForAuthenticatedUser({
        name: repositoryName,
        auto_init: false
    });
    console.log(`Created repository ${repository.full_name}`);

    // Step 2 create an empty file
    const { data: { content: { name: fileName } } } = await octokit.rest.repos.createOrUpdateFileContents({
        owner: repositoryOwner,
        repo: repositoryName,
        path: "README.md",
        message: "Initial commit",
        content: Buffer.from(`
# ${repositoryName}
### Prerequisite
- Add \`google-services.json\`
### Summary
- "${repositoryTitle}"
        `).toString("base64"),
    })
    console.log(`Created file ${ fileName }`);

    // Step 3 get commit SHA
    const { data: { object: { sha: mainHeadSha } } } = await octokit.rest.git.getRef({
        owner: repositoryOwner,
        repo: repositoryName,
        ref: 'heads/main'
    });
    console.log(`main head SHA: ${mainHeadSha}`);

    // Step 4 create tree
    const { data: { sha: createdTreeSha } } = await octokit.rest.git.createTree({
        owner: repositoryOwner,
        repo: repositoryName,
        base_tree: mainHeadSha,
        tree: createAndroidProject(repositoryName, repositoryOwner)
    })
    console.log(`Created Tree SHA: ${createdTreeSha}`)

    // Step 5 create a commit
    const { data: { sha: commitTreeSha } } = await octokit.git.createCommit({
        owner: repositoryOwner,
        repo: repositoryName,
        message: 'Creating android project',
        tree: createdTreeSha,
        parent: [mainHeadSha],
        name: repositoryName,
    });
    console.log(`Commit SHA: ${commitTreeSha}`)

    // Step 6 create a reference branch that I will be committing into
    const { data: { ref: createdReference } } = await octokit.rest.git.createRef({
        owner: repositoryOwner,
        repo: repositoryName,
        ref: 'refs/heads/new-android-project',
        sha: commitTreeSha
    })
    console.log(`Create Ref: ${createdReference}`)
    
    // Step 7 Merge the reference branch to the main
    const { data: { ref: updatedReference } } = await octokit.rest.git.updateRef({
        owner: repositoryOwner,
        repo: repositoryName,
        ref: 'heads/main',
        sha: commitTreeSha,
        force: true
    })
    console.log(`Updated Ref: ${updatedReference}`)

    return repository
}

run();