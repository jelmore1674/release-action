import { setFailed } from "@actions/core";
import { getExecOutput } from "@actions/exec";
import { context } from "@actions/github";
import { readFileSync } from "node:fs";
import { exit } from "node:process";
import { graphqlClient } from "./github";

const ADDITION_REGEX = /^1 (M|A)\./;

/**
 * This is used for creating the type that will be sent to GitHub for file changes.
 */
interface Addition {
  /**
   * The file path to the file with changes.
   */
  path: string;
  /**
   * Base64 encoded file that will be sent to the GitHub api.
   */
  contents: string;
}

/**
 * Add the change of the package.json
 */
async function gitDiff() {
  const { stdout: diff } = await getExecOutput("git", ["status", "--porcelain=v2", "--branch", "--untracked-files=no"]);

  const stagedAdditionFilePaths: string[] = [];
  const stagedDeletionFilePaths: string[] = [];

  const lines = diff.split("\n");

  for (const line of lines) {
    const file = line.split(" ").pop();

    if (file) {
      if (line.match(ADDITION_REGEX)) {
        stagedAdditionFilePaths.push(file);
      }
    }
  }

  const fileAdditions = stagedAdditionFilePaths.reduce((acc, path) => {
    const file = readFileSync(path, { encoding: "utf8" });
    acc.push({ path, contents: Buffer.from(file).toString("base64") });
    return acc;
  }, [] as Addition[]);

  const fileDeletions = stagedDeletionFilePaths.map(path => ({
    path,
  }));

  return { fileAdditions, fileDeletions };
}

/**
 * The git commit oid expected at the head of the branch prior to the commit.
 *
 * @param branch - the branch we are currently on.
 */
async function getExpectedHeadOid(branch: string) {
  const { stdout: branchOid } = await getExecOutput("git", ["ls-remote", "origin", `refs/heads/${branch}`]);
  const { stdout: headOid } = await getExecOutput("git", ["ls-remote", "origin", "refs/heads/HEAD"]);

  // Fallback to the HEAD oid.
  return branchOid.split("\t")[0] || headOid.split("\t")[0];
}

/**
 * Get the current git branch.
 */
async function gitBranch() {
  const { stdout } = await getExecOutput("git", ["branch", "--show-current"]);
  return stdout.trim();
}

/**
 * Commit using the GitHub GraphQL api.
 *
 * @param commitMessage - the commit message.
 *
 * @returns the expectedHeadOid
 */
async function commitWithApi(commitMessage: string) {
  const branch = await gitBranch();
  const repo = `${context.repo.owner}/${context.repo.repo}`;

  const expectedHeadOid = await getExpectedHeadOid(branch);

  const { fileAdditions, fileDeletions } = await gitDiff();

  try {
    await graphqlClient(
      `mutation($expectedHeadOid: GitObjectID!, $fileAdditions: [FileAddition!]!, $fileDeletions: [FileDeletion!]!) {
          createCommitOnBranch(
            input: {
              branch: {
                repositoryNameWithOwner: "${repo}",
                branchName: "${branch}"
              },
              message: { headline: "${commitMessage}" },
              fileChanges: {
                additions: $fileAdditions,
                deletions: $fileDeletions
              },
              expectedHeadOid: $expectedHeadOid
            }
          ){
            commit {
              url,
              changedFilesIfAvailable
            }
          }
        }`,
      {
        expectedHeadOid,
        fileAdditions,
        fileDeletions,
      },
    );

    return expectedHeadOid;
  } catch (error) {
    let errorMessage = "Unable to create commit.";

    if (error instanceof Error) {
      errorMessage = error.message;
    }
    setFailed(errorMessage);
    exit(1);
  }
}

export { commitWithApi };
