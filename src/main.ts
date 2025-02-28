import { Plugin, MarkdownPostProcessorContext, MarkdownView, TFile } from 'obsidian';
import { Chess, Square } from 'chess.js';

const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

var WHITE_KING = "\n<g style=\"fill:none; fill-opacity:1; fill-rule:evenodd; stroke:#000000; stroke-width:1.5; stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4; stroke-dasharray:none; stroke-opacity:1;\"\">\n        <path\n        d=\"M 22.5,11.63 L 22.5,6\"\n        style=\"fill:none; stroke:#000000; stroke-linejoin:miter;\" />\n        <path\n        d=\"M 20,8 L 25,8\"\n        style=\"fill:none; stroke:#000000; stroke-linejoin:miter;\" />\n        <path\n        d=\"M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 25.5,14.5 24.5,12 22.5,12 C 20.5,12 19.5,14.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25\"\n        style=\"fill:#ffffff; stroke:#000000; stroke-linecap:butt; stroke-linejoin:miter;\" />\n        <path\n        d=\"M 11.5,37 C 17,40.5 27,40.5 32.5,37 L 32.5,30 C 32.5,30 41.5,25.5 38.5,19.5 C 34.5,13 25,16 22.5,23.5 L 22.5,27 L 22.5,23.5 C 19,16 9.5,13 6.5,19.5 C 3.5,25.5 11.5,29.5 11.5,29.5 L 11.5,37 z \"\n        style=\"fill:#ffffff; stroke:#000000;\" />\n        <path\n        d=\"M 11.5,30 C 17,27 27,27 32.5,30\"\n        style=\"fill:none; stroke:#000000;\" />\n        <path\n        d=\"M 11.5,33.5 C 17,30.5 27,30.5 32.5,33.5\"\n        style=\"fill:none; stroke:#000000;\" />\n        <path\n        d=\"M 11.5,37 C 17,34 27,34 32.5,37\"\n        style=\"fill:none; stroke:#000000;\" />\n    </g>";
var WHITE_QUEEN = "<g style=\"opacity:1; fill:#ffffff; fill-opacity:1; fill-rule:evenodd; stroke:#000000; stroke-width:1.5; stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4; stroke-dasharray:none; stroke-opacity:1;\"\">\n    <path\n    d=\"M 9 13 A 2 2 0 1 1  5,13 A 2 2 0 1 1  9 13 z\"\n    transform=\"translate(-1,-1)\" />\n    <path\n    d=\"M 9 13 A 2 2 0 1 1  5,13 A 2 2 0 1 1  9 13 z\"\n    transform=\"translate(15.5,-5.5)\" />\n    <path\n    d=\"M 9 13 A 2 2 0 1 1  5,13 A 2 2 0 1 1  9 13 z\"\n    transform=\"translate(32,-1)\" />\n    <path\n    d=\"M 9 13 A 2 2 0 1 1  5,13 A 2 2 0 1 1  9 13 z\"\n    transform=\"translate(7,-4.5)\" />\n    <path\n    d=\"M 9 13 A 2 2 0 1 1  5,13 A 2 2 0 1 1  9 13 z\"\n    transform=\"translate(24,-4)\" />\n    <path\n    d=\"M 9,26 C 17.5,24.5 30,24.5 36,26 L 38,14 L 31,25 L 31,11 L 25.5,24.5 L 22.5,9.5 L 19.5,24.5 L 14,10.5 L 14,25 L 7,14 L 9,26 z \"\n    style=\"stroke-linecap:butt;\" />\n    <path\n    d=\"M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 10.5,36 C 9,37.5 11,38.5 11,38.5 C 17.5,39.5 27.5,39.5 34,38.5 C 34,38.5 35.5,37.5 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 z \"\n    style=\"stroke-linecap:butt;\" />\n    <path\n    d=\"M 11.5,30 C 15,29 30,29 33.5,30\"\n    style=\"fill:none;\" />\n    <path\n    d=\"M 12,33.5 C 18,32.5 27,32.5 33,33.5\"\n    style=\"fill:none;\" />\n</g>";
var WHITE_BISHOP = "<g style=\"opacity:1; fill:none; fill-rule:evenodd; fill-opacity:1; stroke:#000000; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round; stroke-miterlimit:4; stroke-dasharray:none; stroke-opacity:1;\"\">\n<g style=\"fill:#ffffff; stroke:#000000; stroke-linecap:butt;\"> \n    <path\n    d=\"M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.646,38.99 6.677,38.97 6,38 C 7.354,36.06 9,36 9,36 z\" />\n    <path\n    d=\"M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,27.5 27.5,26 27.5,26 C 33,24.5 33.5,14.5 22.5,10.5 C 11.5,14.5 12,24.5 17.5,26 C 17.5,26 15,27.5 15,30 C 15,30 14.5,30.5 15,32 z\" />\n    <path\n    d=\"M 25 8 A 2.5 2.5 0 1 1  20,8 A 2.5 2.5 0 1 1  25 8 z\" />\n</g>\n<path\nd=\"M 17.5,26 L 27.5,26 M 15,30 L 30,30 M 22.5,15.5 L 22.5,20.5 M 20,18 L 25,18\"\nstyle=\"fill:none; stroke:#000000; stroke-linejoin:miter;\" />\n</g>";
var WHITE_KNIGHT = "<g style=\"opacity:1; fill:none; fill-opacity:1; fill-rule:evenodd; stroke:#000000; stroke-width:1.5; stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4; stroke-dasharray:none; stroke-opacity:1;\"\">\n<path\nd=\"M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18\"\nstyle=\"fill:#ffffff; stroke:#000000;\" />\n<path\nd=\"M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10\"\nstyle=\"fill:#ffffff; stroke:#000000;\" />\n<path\nd=\"M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z\"\nstyle=\"fill:#000000; stroke:#000000;\" />\n<path\nd=\"M 15 15.5 A 0.5 1.5 0 1 1  14,15.5 A 0.5 1.5 0 1 1  15 15.5 z\"\ntransform=\"matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)\"\nstyle=\"fill:#000000; stroke:#000000;\" />\n</g>";
var WHITE_ROOK = "<g style=\"opacity:1; fill:#ffffff; fill-opacity:1; fill-rule:evenodd; stroke:#000000; stroke-width:1.5; stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4; stroke-dasharray:none; stroke-opacity:1;\"\">\n<path\nd=\"M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z \"\nstyle=\"stroke-linecap:butt;\" />\n<path\nd=\"M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z \"\nstyle=\"stroke-linecap:butt;\" />\n<path\nd=\"M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14\"\nstyle=\"stroke-linecap:butt;\" />\n<path\nd=\"M 34,14 L 31,17 L 14,17 L 11,14\" />\n<path\nd=\"M 31,17 L 31,29.5 L 14,29.5 L 14,17\"\nstyle=\"stroke-linecap:butt; stroke-linejoin:miter;\" />\n<path\nd=\"M 31,29.5 L 32.5,32 L 12.5,32 L 14,29.5\" />\n<path\nd=\"M 11,14 L 34,14\"\nstyle=\"fill:none; stroke:#000000; stroke-linejoin:miter;\" />\n</g>";
var WHITE_PAWN = "<g>\n<path\nd=\"M 22,9 C 19.79,9 18,10.79 18,13 C 18,13.89 18.29,14.71 18.78,15.38 C 16.83,16.5 15.5,18.59 15.5,21 C 15.5,23.03 16.44,24.84 17.91,26.03 C 14.91,27.09 10.5,31.58 10.5,39.5 L 33.5,39.5 C 33.5,31.58 29.09,27.09 26.09,26.03 C 27.56,24.84 28.5,23.03 28.5,21 C 28.5,18.59 27.17,16.5 25.22,15.38 C 25.71,14.71 26,13.89 26,13 C 26,10.79 24.21,9 22,9 z \"\nstyle=\"opacity:1; fill:#ffffff; fill-opacity:1; fill-rule:nonzero; stroke:#000000; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:miter; stroke-miterlimit:4; stroke-dasharray:none; stroke-opacity:1;\" />\n</g>";
var BLACK_KING = "<g style=\"fill:none; fill-opacity:1; fill-rule:evenodd; stroke:#000000; stroke-width:1.5; stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4; stroke-dasharray:none; stroke-opacity:1;\"\">\n<path \n    d=\"M 22.5,11.63 L 22.5,6\"\n    style=\"fill:none; stroke:#000000; stroke-linejoin:miter;\" />\n<path\n    d=\"M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 25.5,14.5 24.5,12 22.5,12 C 20.5,12 19.5,14.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25\" \n    style=\"fill:#000000;fill-opacity:1; stroke-linecap:butt; stroke-linejoin:miter;\" />\n<path\n   d=\"M 11.5,37 C 17,40.5 27,40.5 32.5,37 L 32.5,30 C 32.5,30 41.5,25.5 38.5,19.5 C 34.5,13 25,16 22.5,23.5 L 22.5,27 L 22.5,23.5 C 19,16 9.5,13 6.5,19.5 C 3.5,25.5 11.5,29.5 11.5,29.5 L 11.5,37 z \"\n   style=\"fill:#000000; stroke:#000000;\" />\n<path\n   d=\"M 20,8 L 25,8\"\n   style=\"fill:none; stroke:#000000; stroke-linejoin:miter;\" />\n<path\n   d=\"M 32,29.5 C 32,29.5 40.5,25.5 38.03,19.85 C 34.15,14 25,18 22.5,24.5 L 22.51,26.6 L 22.5,24.5 C 20,18 9.906,14 6.997,19.85 C 4.5,25.5 11.85,28.85 11.85,28.85\"\n   style=\"fill:none; stroke:#ffffff;\" />\n<path\n   d=\"M 11.5,30 C 17,27 27,27 32.5,30 M 11.5,33.5 C 17,30.5 27,30.5 32.5,33.5 M 11.5,37 C 17,34 27,34 32.5,37\"\n   style=\"fill:none; stroke:#ffffff;\" />\n</g>";
var BLACK_QUEEN = "<g style=\"opacity:1; fill:#000000; fill-opacity:1; fill-rule:evenodd; stroke:#000000; stroke-width:1.5; stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4; stroke-dasharray:none; stroke-opacity:1;\"\">\n<g style=\"fill:#000000; stroke:none;\">\n    <circle cx=\"6\"    cy=\"12\" r=\"2.75\" />\n    <circle cx=\"14\"   cy=\"9\"  r=\"2.75\" />\n    <circle cx=\"22.5\" cy=\"8\"  r=\"2.75\" />\n    <circle cx=\"31\"   cy=\"9\"  r=\"2.75\" />\n    <circle cx=\"39\"   cy=\"12\" r=\"2.75\" />\n</g>\n<path\nd=\"M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 30.7,10.9 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14.3,10.9 L 14,25 L 6.5,13.5 L 9,26 z\"\nstyle=\"stroke-linecap:butt; stroke:#000000;\" />\n<path\nd=\"M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 10.5,36 C 9,37.5 11,38.5 11,38.5 C 17.5,39.5 27.5,39.5 34,38.5 C 34,38.5 35.5,37.5 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 z\"\nstyle=\"stroke-linecap:butt;\" />\n<path\nd=\"M 11,38.5 A 35,35 1 0 0 34,38.5\"\nstyle=\"fill:none; stroke:#000000; stroke-linecap:butt;\" />\n<path\nd=\"M 11,29 A 35,35 1 0 1 34,29\"\nstyle=\"fill:none; stroke:#ffffff;\" />\n<path\nd=\"M 12.5,31.5 L 32.5,31.5\"\nstyle=\"fill:none; stroke:#ffffff;\" />\n<path\nd=\"M 11.5,34.5 A 35,35 1 0 0 33.5,34.5\"\nstyle=\"fill:none; stroke:#ffffff;\" />\n<path\nd=\"M 10.5,37.5 A 35,35 1 0 0 34.5,37.5\"\nstyle=\"fill:none; stroke:#ffffff;\" />\n</g>";
var BLACK_BISHOP = "<g style=\"opacity:1; fill:none; fill-rule:evenodd; fill-opacity:1; stroke:#000000; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round; stroke-miterlimit:4; stroke-dasharray:none; stroke-opacity:1;\"\">\n<g style=\"fill:#000000; stroke:#000000; stroke-linecap:butt;\"> \n    <path\n        d=\"M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.646,38.99 6.677,38.97 6,38 C 7.354,36.06 9,36 9,36 z\" />\n    <path\n        d=\"M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,27.5 27.5,26 27.5,26 C 33,24.5 33.5,14.5 22.5,10.5 C 11.5,14.5 12,24.5 17.5,26 C 17.5,26 15,27.5 15,30 C 15,30 14.5,30.5 15,32 z\" />\n    <path\n        d=\"M 25 8 A 2.5 2.5 0 1 1  20,8 A 2.5 2.5 0 1 1  25 8 z\" />\n</g>\n<path\n   d=\"M 17.5,26 L 27.5,26 M 15,30 L 30,30 M 22.5,15.5 L 22.5,20.5 M 20,18 L 25,18\"\n   style=\"fill:none; stroke:#ffffff; stroke-linejoin:miter;\" />\n</g>";
var BLACK_KNIGHT = "<g style=\"opacity:1; fill:none; fill-opacity:1; fill-rule:evenodd; stroke:#000000; stroke-width:1.5; stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4; stroke-dasharray:none; stroke-opacity:1;\"\">\n<path\n   d=\"M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18\"\n   style=\"fill:#000000; stroke:#000000;\" />\n<path\n   d=\"M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10\"\n   style=\"fill:#000000; stroke:#000000;\" />\n<path\n   d=\"M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z\"\n   style=\"fill:#ffffff; stroke:#ffffff;\" />\n<path\n   d=\"M 15 15.5 A 0.5 1.5 0 1 1  14,15.5 A 0.5 1.5 0 1 1  15 15.5 z\"\n   transform=\"matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)\"\n   style=\"fill:#ffffff; stroke:#ffffff;\" />\n<path\n   d=\"M 24.55,10.4 L 24.1,11.85 L 24.6,12 C 27.75,13 30.25,14.49 32.5,18.75 C 34.75,23.01 35.75,29.06 35.25,39 L 35.2,39.5 L 37.45,39.5 L 37.5,39 C 38,28.94 36.62,22.15 34.25,17.66 C 31.88,13.17 28.46,11.02 25.06,10.5 L 24.55,10.4 z \"\n   style=\"fill:#ffffff; stroke:none;\" />\n</g>";
var BLACK_ROOK = "<g style=\"opacity:1; fill:#000000; fill-opacity:1; fill-rule:evenodd; stroke:#000000; stroke-width:1.5; stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4; stroke-dasharray:none; stroke-opacity:1;\"\">\n<path\nd=\"M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z \"\nstyle=\"stroke-linecap:butt;\" />\n<path\nd=\"M 12.5,32 L 14,29.5 L 31,29.5 L 32.5,32 L 12.5,32 z \"\nstyle=\"stroke-linecap:butt;\" />\n<path\nd=\"M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z \"\nstyle=\"stroke-linecap:butt;\" />\n<path\nd=\"M 14,29.5 L 14,16.5 L 31,16.5 L 31,29.5 L 14,29.5 z \"\nstyle=\"stroke-linecap:butt;stroke-linejoin:miter;\" />\n<path\nd=\"M 14,16.5 L 11,14 L 34,14 L 31,16.5 L 14,16.5 z \"\nstyle=\"stroke-linecap:butt;\" />\n<path\nd=\"M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14 L 11,14 z \"\nstyle=\"stroke-linecap:butt;\" />\n<path\nd=\"M 12,35.5 L 33,35.5 L 33,35.5\"\nstyle=\"fill:none; stroke:#ffffff; stroke-width:1; stroke-linejoin:miter;\" />\n<path\nd=\"M 13,31.5 L 32,31.5\"\nstyle=\"fill:none; stroke:#ffffff; stroke-width:1; stroke-linejoin:miter;\" />\n<path\nd=\"M 14,29.5 L 31,29.5\"\nstyle=\"fill:none; stroke:#ffffff; stroke-width:1; stroke-linejoin:miter;\" />\n<path\nd=\"M 14,16.5 L 31,16.5\"\nstyle=\"fill:none; stroke:#ffffff; stroke-width:1; stroke-linejoin:miter;\" />\n<path\nd=\"M 11,14 L 34,14\"\nstyle=\"fill:none; stroke:#ffffff; stroke-width:1; stroke-linejoin:miter;\" />\n</g>";
var BLACK_PAWN = "<g>\n<path\nd=\"M 22,9 C 19.79,9 18,10.79 18,13 C 18,13.89 18.29,14.71 18.78,15.38 C 16.83,16.5 15.5,18.59 15.5,21 C 15.5,23.03 16.44,24.84 17.91,26.03 C 14.91,27.09 10.5,31.58 10.5,39.5 L 33.5,39.5 C 33.5,31.58 29.09,27.09 26.09,26.03 C 27.56,24.84 28.5,23.03 28.5,21 C 28.5,18.59 27.17,16.5 25.22,15.38 C 25.71,14.71 26,13.89 26,13 C 26,10.79 24.21,9 22,9 z \"\nstyle=\"opacity:1; fill:#000000; fill-opacity:1; fill-rule:nonzero; stroke:#000000; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:miter; stroke-miterlimit:4; stroke-dasharray:none; stroke-opacity:1;\" />\n</g>";


// SVG definitions for chess pieces
const PIECE_SVG = {
    'w': {
        'k': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">${WHITE_KING}</svg>`,
        'q': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">${WHITE_QUEEN}</svg>`,
        'r': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">${WHITE_ROOK}</svg>`,
        'b': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">${WHITE_BISHOP}</svg>`,
        'n': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">${WHITE_KNIGHT}</svg>`,
        'p': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">${WHITE_PAWN}</svg>`
    },
    'b': {
        'k': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">${BLACK_KING}</svg>`,
        'q': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">${BLACK_QUEEN}</svg>`,
        'r': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">${BLACK_ROOK}</svg>`,
        'b': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">${BLACK_BISHOP}</svg>`,
        'n': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">${BLACK_KNIGHT}</svg>`,
        'p': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">${BLACK_PAWN}</svg>`
    }
};

export default class ChessViewerPlugin extends Plugin {
    private currentFen: string = DEFAULT_FEN;

    async onload() {
        console.log("Loading chess viewer plugin");

        this.registerMarkdownCodeBlockProcessor(
            'chess-viewer',
            (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
                const container = createDiv({ cls: 'chess-viewer-container' });
                el.appendChild(container);
                
                const fen = source.trim() === '{{fen}}' ? this.currentFen : source.trim();
                this.renderBoard(container, this.completeFen(fen));
            }
        );

        this.registerDomEvent(document, 'mousedown', (evt) => {
            const target = evt.target as HTMLElement;
            this.handleInteraction(target);
        });

        this.registerDomEvent(document, 'touchstart', (evt) => {
            evt.preventDefault();
            const target = evt.target as HTMLElement;
            this.handleInteraction(target);
        });
    }

    private color(fen: string) {
        if (fen.split(" ")[1] == 'w') {
            return 'white';
        }
        return 'black';
    }

    private async handleInteraction(target: HTMLElement) {
        console.log("Interaction target:", target);

        let fenText = target.getAttribute("data-fen");
        
        if (fenText) {
            const newFen = this.completeFen(fenText.trim());
            console.log("Found FEN:", newFen);

            if (this.currentFen !== newFen) {
                this.currentFen = newFen;
                console.log("Updating board with FEN:", this.currentFen);
                
                const leaves = this.app.workspace.getLeavesOfType('markdown');
                let hasChessboard = false;

                for (const leaf of leaves) {
                    const view = leaf.view as MarkdownView;
                    if (view?.file?.basename === 'Chessboard') {
                        hasChessboard = true;
                        console.log("Updating existing chessboard");
                        const content = '```chess-viewer\n' + this.currentFen + '\n```';
                        const content2 = '\n[online](https://lichess.org/analysis/' + fenText + '?color=' + this.color(this.currentFen) + ')\n';
                        await view.editor.setValue(content + content2);
                        await view.editor.refresh();
                    }
                }

                if (!hasChessboard) {
                    console.log("Creating new chessboard");
                    const leaf = this.app.workspace.getLeaf('split', 'vertical');
                    const file = await this.ensureChessboardFile();
                    if (file instanceof TFile) {
                        await leaf.openFile(file);
                        const view = leaf.view as MarkdownView;
                        const content = '```chess-viewer\n' + this.currentFen + '\n```';
                        const content2 = '\n[online](https://lichess.org/analysis/' + fenText + '?color=' + this.color(this.currentFen) + ')\n';
                        await view.editor.setValue(content + content2);
                        await view.editor.refresh();
                    }
                }
            }
        }
    }

    private async ensureChessboardFile(): Promise<TFile> {
        let file = this.app.vault.getAbstractFileByPath('Chessboard.md');
        if (!file) {
            file = await this.app.vault.create(
                'Chessboard.md',
                '```chess-viewer\n{{fen}}\n```'
            );
        }
        return file as TFile;
    }

    private completeFen(baseFen: string): string {
        const parts = baseFen.split(/\s+/);
        if (parts.length === 6) return baseFen;
        
        const position = parts[0];
        const defaultParts = ['w', 'KQkq', '-', '0', '1'];
        const completeParts = [position, ...defaultParts.slice(parts.length - 1)];
        
        return completeParts.join(' ');
    }

    private renderBoard(container: HTMLDivElement, fen: string) {
        try {
            console.log("Rendering board with FEN:", fen);
            const chess = new Chess(fen);
            const board = createDiv({ cls: 'chess-board' });
            container.appendChild(board);
            
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const square = createDiv({
                        cls: `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`
                    });
                    board.appendChild(square);

                    const file = String.fromCharCode(97 + col);
                    const rank = 8 - row;
                    const squareNotation = `${file}${rank}` as Square;

                    const piece = chess.get(squareNotation);
                    if (piece) {
                        const pieceDiv = createDiv({
                            cls: `piece ${piece.color} ${piece.type}`
                        });
                        
                        // Insert SVG piece instead of Unicode character
                        pieceDiv.innerHTML = PIECE_SVG[piece.color][piece.type];
                        square.appendChild(pieceDiv);
                    }
                }
            }
        } catch (e) {
            container.textContent = 'Invalid FEN position';
            console.error(e);
        }
    }
}

function createDiv(options?: { cls?: string }): HTMLDivElement {
    const div = document.createElement('div');
    if (options?.cls) {
        div.className = options.cls;
    }
    return div;
}