# Guidelines for contribution

## Table of Contents

- [Guidelines for contribution](#guidelines-for-contribution)
  - [Table of Contents](#table-of-contents)
  - [Language](#language)
  - [Git branch flow](#git-branch-flow)
  - [Git commit message conventions](#git-commit-message-conventions)
    - [`<type>`](#type)
    - [`[optional scope]`](#optional-scope)
    - [`<description>`](#description)
    - [`[optional body]`](#optional-body)
    - [`[optional footer]`](#optional-footer)
    - [About breaking changes](#about-breaking-changes)

## Language

Git branch names, commit messages, and GitHub pull requests must be written in English so that developers around the world can read them.

## Git branch flow

- The [GitHub Flow](http://scottchacon.com/2011/08/31/github-flow.html) is used for the development of this project.

- Anything in the `main` branch is deployable.

- To work on something new, you create a branch and add `feature/` as a prefix to its name.

- The branch name should start with a verb and be as concise and clear as possible.

```bash
# Example
feature/implement-xxx
feature/support-xxx-for-xxx
feature/fix-xxx-bugs
```

See here for more details.
[GitHub Flow - Scott Chacon](http://scottchacon.com/2011/08/31/github-flow.html)

## Git commit message conventions

The commit format follows [Conventional Commits](https://www.conventionalcommits.org/).
Here's an overview

```bash
# Format.
<type>[optional scope]: <description>

[optional body].

[optional footer].
```

### `<type>`

There is only one purpose for a commit, and that is to add the following commit type to the beginning of the first line of the commit message Add the message.

|  `<type>`  | usage                                                                                                 |
| :--------: | :---------------------------------------------------------------------------------------------------- |
|   `feat`   | new feature                                                                                           |
|   `fix`    | bug fix                                                                                               |
|   `docs`   | changes to documentation only                                                                         |
|  `style`   | changes that do not affect the meaning of the code (whitespace, formatting, missing semicolons, etc.) |
| `refactor` | code changes that do not fix bugs and do not add functionality                                        |
|   `perf`   | code changes that improve performance                                                                 |
|   `test`   | add missing tests or fix existing tests                                                               |
|  `build`   | changes that affect the build system or external dependencies (scope examples: gulp, brocooli, npm)   |
|    `ci`    | changes to CI configuration files and scripts (scope examples: gulp, brocooli, npm)                   |
|  `chore`   | other changes that do not change src or test files                                                    |
|  `revert`  | revert a previous commit                                                                              |

```bash
# Example
feat: allow provided config object to extend other configs


# Bad example
feat:Allow provided config object to extend other configs # No space between `<type>` and `<description>`.

<Feat> allow provided config object to extend other configs # No need for `<` and `>`.

Feat: allow provided config object to extend other configs # `type` is uppercase

chore allow provided config object to extend other configs # No colon `:` between `<type>` and `<description>`.
```

### `[optional scope]`

`[optional scope]`

```bash
feat(lang): add polish language
```

### `<description>`

- The `<description>` (summary) is a summary of the changes.

- It should be no more than 50 characters long, including the commit type.

- Do not include the period.

- Start with a lowercase letter.

```bash
# Example
feat: allow provided config object to extend other configs.


# Bad example.
FEAT: feat: allow provided config object to extend other configs # `<type>` is uppercase.

feat: Implement sign up system. Because ... # Summary is too long.
```

### `[optional body]`

- `[optional body]` is a description of what was changed in that commit.

- It should be written with a single blank line between it and `<description>`.

- Do not include the period.

- Start with a capital letter, and write one line at a time.

```bash
# Example
fix: correct minor typos in code

typos fixed


# Bad example 1: no blank line between lines 1 and 2.
fix: correct minor typos in code
see the issue for details on the typos fixed


# Bad example 2: period in code
fix: correct minor typos in code

see the issue for details on the typos fixed.


# Bad example 3: not starting with a lowercase letter
fix: correct minor typos in code

See the issue for details on the typos fixed
```

### `[optional footer]`

- `[optional footer]` is the issue number for destructive or code changes.

- It should be written with one blank line between it and the `[optional body]`.

- Do not include the period.

- Start with a capital letter, and write one line at a time.

```bash
# Example
fix: prevent racing of requests

Introduce a request id and a reference to latest request.
Dismiss incoming responses other than from latest request.

Remove timeouts which were used to mitigate the racing issue but are obsolete now.
Remove timeouts which were used to mitigate the racing issue but are obsolete now.

Reviewed-by: Z
Refs: #123


# Example 2
feat: allow provided config object to extend other configs

BREAKING CHANGE: `extends` key in config file is now used for extending other config files
```

### About breaking changes

- In the case of BreakingChange, you can do something like this.

```bash
# To draw attention to a breaking change, add `!`.
feat!: send an email to the customer when a product is shipped


# Commit the message with scope and use `!` to draw attention to disruptive changes
feat(api)!: send an email to the customer when a product is shipped


# `!` and the `BREAKING CHANGE` footer to commit the message
chore!: drop support for Node 6

BREAKING CHANGE: use JavaScript features not available in Node 6.
```
