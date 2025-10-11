<div align="center">
  <h1>EnhancedVitest</h1>
  <p><strong>The official Vitest enhancement suite for Deepractice projects.</strong></p>

  <!-- Badges -->
  <p>
    <a href="https://github.com/Deepractice/EnhancedVitest"><img src="https://img.shields.io/github/stars/Deepractice/EnhancedVitest?style=social" alt="Stars"/></a>
    <img src="https://komarev.com/ghpvc/?username=EnhancedVitest&label=views&color=0e75b6&style=flat&abbreviated=true" alt="Views"/>
    <a href="LICENSE"><img src="https://img.shields.io/github/license/Deepractice/EnhancedVitest?color=blue" alt="License"/></a>
  </p>
</div>

---

This monorepo contains all Vitest enhancements and extensions developed by Deepractice. As we continue to build and refine our testing infrastructure, all Vitest-related improvements will be developed and maintained here.

## Project Vision

EnhancedVitest serves as the central hub for Deepractice's Vitest ecosystem:

- **Unified Development**: All Vitest enhancements in one place for better coordination
- **Quality Assurance**: Consistent testing standards across Deepractice projects
- **Community Contribution**: Open for the community to build upon our testing infrastructure
- **Future Growth**: New packages and features will be added as testing needs evolve

## Packages

### [@deepracticex/vitest-cucumber](./packages/vitest-cucumber) [![npm version](https://img.shields.io/npm/v/@deepracticex/vitest-cucumber)](https://www.npmjs.com/package/@deepracticex/vitest-cucumber)

Cucumber BDD integration for Vitest. Write behavior-driven tests using Gherkin syntax while leveraging Vitest's speed and developer experience.

**Status**: ✅ Stable
**Use Cases**: BDD testing, E2E scenarios, acceptance testing

### [@deepracticex/vitest-cucumber-plugin](./packages/vitest-cucumber-plugin) [![npm version](https://img.shields.io/npm/v/@deepracticex/vitest-cucumber-plugin)](https://www.npmjs.com/package/@deepracticex/vitest-cucumber-plugin)

Vitest plugin for transforming Cucumber feature files to test code.

**Status**: ✅ Stable
**Use Cases**: Feature file transformation, Vitest integration

## For Wrapper Package Authors

If you're building a wrapper package around vitest-cucumber, you can use the `runtimeModule` option to eliminate the need for users to directly depend on `@deepracticex/vitest-cucumber`.

**Quick example:**

```typescript
// Your wrapper's vitest config
vitestCucumber({
  runtimeModule: '@your-org/testing-utils',
});
```

Then re-export the runtime APIs in your package, and users only need to install your wrapper! See the [vitest-cucumber-plugin README](./packages/vitest-cucumber-plugin#creating-wrapper-packages) for a complete guide.

## Roadmap

Future enhancements under consideration:

- Visual regression testing utilities
- Performance testing helpers
- Snapshot testing enhancements
- Test data generation tools
- Custom reporters and formatters

## Contributing

Contributions are welcome! Please see individual package READMEs for specific contribution guidelines.

## License

MIT © Deepractice
