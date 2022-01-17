enum TokenType {
  EndOfFile,
  LeftParen,
  RightParen,
  String,
  Number,
  Identifier,
}
interface Token {
  /** Type of the token. */
  type: TokenType;

  /** Raw text for the token. */
  text: string;

  /** The object this is referring to (used for literals). */
  object?: unknown;
}

const tokenize = (input: string): Token[] => {
  const tokenizer = new Tokenizer(input);
  return tokenizer.tokenize();
};

class Tokenizer {
  private readonly tokens: Token[] = [];
  private position = 0;
  private tokenStart = 0;

  constructor(private readonly source: string) {}

  public tokenize(): Token[] {
    while (!this.isAtEnd()) {
      this.tokenStart = this.position;
      this.scanToken();
    }
    this.tokens.push({ type: TokenType.EndOfFile, text: "" });
    return this.tokens;
  }

  private scanToken() {
    const char = this.advance();
    switch (char) {
      case "(":
        return this.addToken(TokenType.LeftParen);
      case ")":
        return this.addToken(TokenType.RightParen);
      case ";":
        // Handle comments by just consuming everything until end of line.
        while (!this.isAtEnd() && this.peek() !== "\n") {
          this.advance();
        }
        return;
      case " ":
      case "\n":
      case "\t":
        return;
      case '"':
        return this.string();
      default:
        if (this.isDigit(char)) {
          return this.number();
        }

        if (this.isAlpha(char)) {
          return this.identifier();
        }
        throw new Error(`Unexpected character ${char}`);
    }
  }

  private identifier() {
    while (this.isIdentifierCharacter(this.peek())) {
      this.advance();
    }
    this.addToken(TokenType.Identifier);
  }

  private isDigit(char: string) {
    return char.match(/[0-9]/);
  }

  private isAlpha(char: string) {
    return char.match(/[a-z]/i);
  }
  private isIdentifierCharacter(char: string) {
    return (
      this.isAlpha(char) ||
      this.isDigit(char) ||
      char === "!" ||
      char === "_" ||
      char === "-"
    );
  }

  private number() {
    while (this.isDigit(this.peek())) {
      this.advance();
    }

    if (this.peek() === ".") {
      this.advance();
      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }

    return this.addToken(
      TokenType.Number,
      parseFloat(this.source.slice(this.tokenStart, this.position))
    );
  }

  private string() {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      this.advance();
    }

    if (this.isAtEnd()) {
      throw new Error("Unterminated string.");
    }

    this.advance();

    return this.addToken(
      TokenType.String,
      this.source.slice(this.tokenStart + 1, this.position - 1)
    );
  }

  private isAtEnd() {
    return this.position >= this.source.length;
  }

  private peek() {
    if (this.isAtEnd()) return "\0";
    return this.source[this.position];
  }

  private advance() {
    return this.source[this.position++];
  }

  private addToken(type: TokenType, object?: unknown) {
    const text = this.source.slice(this.tokenStart, this.position);
    if (object !== undefined) {
      this.tokens.push({ type, text, object });
    } else {
      this.tokens.push({ type, text });
    }
  }
}

export { Tokenizer, Token, TokenType, tokenize };
