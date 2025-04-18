# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - TBD

### Security

- Updates `typescript` from 5.8.2 to 5.8.3 ([`12d6a70`](https://github.com/jelmore1674/release-semver-action/commit/12d6a7004b93089ed5acd89297ecf7f3c68396aa)) ([#15](https://github.com/jelmore1674/release-semver-action/pull/15)) ([dependabot](https://github.com/apps/dependabot))

## [1.1.0] - 2025-04-11

### Added

- Flag when setting npm version so the `.npmrc` is no longer required. ([#13](https://github.com/jelmore1674/release-semver-action/pull/13)) ([Justin Elmore](https://github.com/jelmore1674))
- Optional `commit_message` input to customize commit message. ([#12](https://github.com/jelmore1674/release-semver-action/pull/12)) ([Justin Elmore](https://github.com/jelmore1674))

### Removed

- No longer commits `package.json` as a single commit. ([#12](https://github.com/jelmore1674/release-semver-action/pull/12)) ([Justin Elmore](https://github.com/jelmore1674))

## [1.0.1] - 2025-04-06

### Changed

- Removed [skip ci] flag from `package.json` commit message. ([#10](https://github.com/jelmore1674/release-semver-action/pull/10)) ([Justin Elmore](https://github.com/jelmore1674))

### Added

- Support for committing delete files. ([#10](https://github.com/jelmore1674/release-semver-action/pull/10)) ([Justin Elmore](https://github.com/jelmore1674))

## [1.0.0] - 2025-04-05

_Initial Release_

[1.1.0]: https://github.com/jelmore1674/release-semver-action/releases/tag/v1.1.0
[1.0.1]: https://github.com/jelmore1674/release-semver-action/releases/tag/v1.0.1
[1.0.0]: https://github.com/jelmore1674/release-semver-action/releases/tag/v1.0.0
