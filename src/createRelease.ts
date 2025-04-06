import { getInput, setFailed, setOutput } from "@actions/core";
import { context } from "@actions/github";
import { debug } from "node:console";
import { exit } from "node:process";
import { gitBranch } from "./git";
import { restClient } from "./github";

async function createRelease(version: string) {
  try {
    const { owner, repo } = context.repo;

    const body = getInput("body", { required: false });
    const releaseName = getInput("release_name", { required: false });
    const gitTagPrefix = getInput("git_tag_prefix", { required: true });

    // biome-ignore lint/style/useNamingConvention: this is the name of the variable passed to the api.
    const generate_release_notes = !body;
    // biome-ignore lint/style/useNamingConvention: this is the name of the variable passed to the api.
    const tag_name = `${gitTagPrefix}${version}`;
    // biome-ignore lint/style/useNamingConvention: this is the name of the variable passed to the api.
    const target_commitish = await gitBranch();

    debug(`bodyInput: ${body}`);
    debug(`releaseNameInput: ${releaseName}`);
    debug(`gitTagPrefixInput: ${gitTagPrefix}`);
    debug(`generateReleaseNotes: ${generate_release_notes}`);
    debug(`tag_name: ${tag_name}`);
    debug(`target_commitish: ${target_commitish}`);

    const createdRelease = await restClient.repos.createRelease({
      owner,
      repo,
      tag_name,
      name: releaseName || tag_name,
      target_commitish,
      body,
      generate_release_notes,
    });

    const { data: { id, html_url, upload_url } } = createdRelease;

    setOutput("release_id", id);
    setOutput("html_url", html_url);
    setOutput("upload_url", upload_url);
  } catch (error) {
    let errorMessage = "Unable to create release.";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    setFailed(errorMessage);
    exit(1);
  }
}

export { createRelease };
