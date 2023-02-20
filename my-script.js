const owner = "firebase"
const repo = "firebase-android-sdk"

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

async function run() {
  // const GITHUB_TOKEN = process.env.GITHUB_TOKEN
  // const octokit = github.getOctokit(GITHUB_TOKEN)

await octokit.request('GET /repos/{owner}/{repo}/issues', {
  owner: owner,
  repo: repo
})

  console.log(data);
}

run();
