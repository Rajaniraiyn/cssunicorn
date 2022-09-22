class CSSUnicorn {
  base: {
    css: string;
    value: number;
    unit: string;
    isAngle: boolean;
  };

  #angleUnits = ["deg", "grad", "rad", "turn"];

  #element!: HTMLDivElement;

  constructor(valueWithUnit: string) {
    this.base = {
      css: valueWithUnit,
      value: +valueWithUnit.replace(/\D+/, ""),
      unit: valueWithUnit.replace(/\d+/, ""),
      isAngle: false,
    };

    this.base.isAngle = this.#angleUnits.includes(this.base.unit);

    this.#createElement();
  }

  #pixelUnit() {
    return +this.#getStyle(this.#element, "font-size").replace("px", "");
  }

  #getStyle(element: HTMLElement, property: string) {
    return getComputedStyle(element).getPropertyValue(property);
  }

  #createElement() {
    this.#element = document.createElement("div");
    this.#element.setAttribute("aria-label", "hidden");
    this.#element.style.cssText = "position: absolute; z-index: -999999;";
    this.#element.style.setProperty("font-size", this.base.css);
    this.#element = document.body.appendChild(this.#element);
  }

  #cloneStyles(element: HTMLElement) {
    this.#element.style.cssText = getComputedStyle(element).cssText;
  }

  #radUnit() {
    const { value, unit } = this.base;

    switch (unit) {
      case "deg":
        return value * (Math.PI / 180);

      case "grad":
        return value * (Math.PI / 200);

      case "turn":
        return value * 2 * Math.PI;

      default:
        return value;
    }
  }

  #clean() {
    this.#element.innerText = "";
    this.#element.style.cssText = "position: absolute; z-index: -999999;";
  }

  to(unit: string, context: HTMLElement = this.#element) {
    const { unit: baseUnit } = this.base;
    if (unit === baseUnit) return this.base.css;

    let convertedValue = null;
    const pixel = this.#pixelUnit();

    if (!!context) this.#cloneStyles(context as HTMLElement);

    unit = unit.toLowerCase();

    if (this.base.isAngle) {
      const rad = this.#radUnit();

      switch (unit) {
        case "deg":
          convertedValue = (rad * 180) / Math.PI;
          break;

        case "turn":
          convertedValue = rad / (2 * Math.PI);
          break;

        case "grad":
          convertedValue = (rad * 200) / Math.PI;
          break;

        case "rad":
          convertedValue = rad;

        default:
          throw new Error("Invalid unit");
      }
    }

    switch (unit) {
      case "px":
        convertedValue = pixel;
        break;

      case "ch":
        this.#element.innerText = "0";
        const fontWidth = +this.#getStyle(context, "width").replace("px", "");
        convertedValue = pixel / fontWidth;
        break;

      case "ex":
        this.#element.innerText = "x";
        const fontHeight = +this.#getStyle(context, "height").replace("px", "");
        convertedValue = pixel / fontHeight;
        break;

      case "ic":
        this.#element.innerText = "水"; // CJK water ideograph, U+6C34
        const fontIc = +this.#getStyle(context, "width").replace("px", "");
        convertedValue = pixel / fontIc;
        break;

      case "rem":
        const rootFontSize = +this.#getStyle(
          document.documentElement,
          "font-size"
        ).replace("px", "");
        convertedValue = pixel / rootFontSize;
        break;

      case "em":
        const parentFontSize = +this.#getStyle(
          (context ?? this.#element).parentElement!,
          "font-size"
        ).replace("px", "");
        convertedValue = pixel / parentFontSize;
        break;

      case "vw":
        const viewportWidth = window.innerWidth;
        convertedValue = (pixel / viewportWidth) * 100;
        break;

      case "vh":
        const viewportHeight = window.innerHeight;
        convertedValue = (pixel / viewportHeight) * 100;
        break;

      case "vmax":
        const viewportMax = Math.max(window.innerWidth, window.innerHeight);
        convertedValue = (pixel / viewportMax) * 100;
        break;

      case "vmin":
        const viewportMin = Math.min(window.innerWidth, window.innerHeight);
        convertedValue = (pixel / viewportMin) * 100;
        break;

      case "cm":
        convertedValue = (pixel / 96) * 2.54;
        break;

      case "mm":
        convertedValue = (pixel / 96) * 25.4;
        break;

      case "q":
        convertedValue = (pixel / 96) * 101.6;
        break;

      case "in":
        convertedValue = pixel / 96;
        break;

      case "pc":
        convertedValue = pixel / 16;
        break;

      case "pt":
        convertedValue = pixel / 1.3333333333333333;
        break;

      default:
        throw new Error("Invalid unit");
    }

    this.#clean();

    return `${convertedValue.toFixed(3)}${unit}`;
  }

  destroy() {
    this.#element.remove();
  }
}

function convertCSSUnit(from: string, to: string) {
  return new CSSUnicorn(from).to(to);
}

export { CSSUnicorn, convertCSSUnit as default };
