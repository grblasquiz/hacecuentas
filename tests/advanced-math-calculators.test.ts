import { describe, expect, it } from "vitest";
import * as m from "../src/lib/formulas/matematica-avanzada";

describe("20 calculadoras de matemática avanzada", () => {
  it("calcula un límite removible", () =>
    expect(
      m.limitesPasoAPaso({
        funcion: "(x^2-1)/(x-1)",
        punto: 1,
        direccion: "ambos",
      }).result,
    ).toContain("2"));
  it("factoriza un trinomio", () =>
    expect(
      m.factorizacionPolinomios({ coeficientes: "1 -5 6" }).formaFactorizada,
    ).toContain("(x − 2)"));
  it("resuelve una inecuación", () =>
    expect(
      m.inecuaciones({ coeficientes: "1 -5 6", operador: ">=" }).resultado,
    ).toContain("2"));
  it("encuentra raíces reales y complejas", () =>
    expect(m.raicesPolinomio({ coeficientes: "1 0 1" }).raices).toContain("i"));
  it("aplica Ruffini", () =>
    expect(m.reglaRuffini({ coeficientes: "1 0 -4 3", raiz: 1 }).resto).toBe(
      0,
    ));
  it("divide polinomios", () =>
    expect(
      m.divisionPolinomios({ dividendo: "1 0 -1", divisor: "1 -1" }).cociente,
    ).toBe("x+1"));
  it("resuelve un sistema 3x3", () =>
    expect(
      m.sistemaEcuaciones3x3({ matriz: "2 1 -1 8; -3 -1 2 -11; -2 1 2 -3" })
        .solucion,
    ).toContain("x = 2"));
  it("reduce por Gauss-Jordan", () =>
    expect(m.gaussJordan({ matriz: "1 2 5; 3 4 11" }).rango).toBe(2));
  it("invierte una matriz 3x3", () =>
    expect(
      m.determinanteInversa3x3({ matriz: "1 2 3; 0 1 4; 5 6 0" }).determinante,
    ).toBe(1));
  it("opera números complejos", () =>
    expect(
      m.numerosComplejos({ z1: "3+4i", z2: "1-2i", operacion: "suma" })
        .resultado,
    ).toContain("4 + 2i"));
  it("detecta restricciones de dominio", () =>
    expect(
      m.dominioRangoFuncion({ funcion: "sqrt(x-2)" }).restricciones,
    ).toContain("radicando"));
  it("detecta asíntota horizontal", () =>
    expect(
      m.asintotasFuncion({ numerador: "2 1", denominador: "1 -3" }).alInfinito,
    ).toContain("2"));
  it("calcula tangente y normal", () =>
    expect(
      m.rectaTangenteNormal({ funcion: "x^2", punto: 2 }).pendienteTangente,
    ).toBe(4));
  it("clasifica extremos", () =>
    expect(
      m.maximosMinimosFuncion({ funcion: "x^2", min: -5, max: 5 })
        .puntosCriticos,
    ).toContain("mínimo"));
  it("calcula derivada parcial", () =>
    expect(
      m.derivadasParciales({
        funcion: "x^2*y",
        variable: "x",
        x: 2,
        y: 3,
        z: 0,
      }).evaluacion,
    ).toBe(12));
  it("calcula derivación implícita", () =>
    expect(
      m.derivacionImplicita({ ecuacion: "x^2+y^2=25", x: 3, y: 4 }).evaluacion,
    ).toBeCloseTo(-0.75));
  it("calcula área entre curvas", () =>
    expect(
      m.areaEntreCurvas({
        funcion1: "2*x",
        funcion2: "x^2",
        desde: 0,
        hasta: 2,
      }).areaTotal,
    ).toBeCloseTo(4 / 3, 5));
  it("opera vectores 3D", () =>
    expect(
      m.vectores({ vectorA: "1 2 3", vectorB: "4 5 6" }).productoCruz,
    ).toBe("-3, 6, -3"));
  it("aproxima con Taylor", () =>
    expect(
      m.serieTaylorMaclaurin({
        funcion: "sin(x)",
        centro: 0,
        orden: 5,
        valor: 1,
      }).aproximacion,
    ).toBeCloseTo(Math.sin(1), 3));
  it("calcula transformada de Laplace", () =>
    expect(
      m.transformadaLaplace({ funcion: "3*t^2+2*sin(4*t)" }).resultado,
    ).toContain("6/s^3"));
  it("calcula límite al infinito", () =>
    expect(
      m.limitesPasoAPaso({ funcion: "1/x", punto: "inf", direccion: "ambos" })
        .result,
    ).toContain("0"));
  it("resuelve inecuación racional excluyendo el denominador", () =>
    expect(
      m.inecuaciones({
        tipo: "racional",
        coeficientes: "1 0",
        denominador: "1 -1",
        operador: ">",
      }).resultado,
    ).toContain("1"));
  it("devuelve todas las raíces complejas n-ésimas", () =>
    expect(
      m
        .numerosComplejos({ z1: "1", z2: "0", operacion: "raiz", exponente: 3 })
        .raices.split(","),
    ).toHaveLength(3));
  it("aplica corrimiento y funciones hiperbólicas en Laplace", () => {
    expect(
      m.transformadaLaplace({ funcion: "exp(2*t)*sin(3*t)" }).resultado,
    ).toContain("(s−2)");
    expect(m.transformadaLaplace({ funcion: "sinh(2*t)" }).resultado).toContain(
      "s^2−4",
    );
  });
});
