# Building a CLI in Rust

A beginner tutorial for writing command line tools in Rust.

## Getting Started

1. Create a new binary project:

   ```bash
   cargo new grrs
   cd grrs
   ```

2. Parse command line arguments:

   ```rust
   use clap::Parser;

   #[derive(Parser)]
   struct Cli {
       pattern: String,
       path: std::path::PathBuf,
   }

   fn main() {
       let args = Cli::parse();
       println!("pattern: {:?}, path: {:?}", args.pattern, args.path);
   }
   ```

3. Test your program locally:

   ```bash
   cargo run -- test file.txt
   ```

## Comparison of Argument Parsers

| Library | Version | Compile Time | Overhead |
| :--- | :--- | :--- | :--- |
| clap | 4.4 | Moderate | Rich features |
| pico-args | 0.5 | Ultra-fast | Minimal |

## License

Dual-licensed under MIT or Apache 2.0.
