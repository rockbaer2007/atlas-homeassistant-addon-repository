export class ModuleVersionMatcher {
    isCompatible(required, available) {
        if (required === "*") {
            return true;
        }
        const requiredVersion = this.parse(required.startsWith("^")
            ? required.slice(1)
            : required);
        const availableVersion = this.parse(available);
        if (!requiredVersion || !availableVersion) {
            return false;
        }
        if (!required.startsWith("^")) {
            return this.compare(availableVersion, requiredVersion) === 0;
        }
        if (availableVersion[0] !== requiredVersion[0]) {
            return false;
        }
        if (requiredVersion[0] === 0 && availableVersion[1] !== requiredVersion[1]) {
            return false;
        }
        return this.compare(availableVersion, requiredVersion) >= 0;
    }
    parse(value) {
        const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(value);
        if (!match) {
            return undefined;
        }
        return [Number(match[1]), Number(match[2]), Number(match[3])];
    }
    compare(first, second) {
        for (let index = 0; index < first.length; index += 1) {
            if (first[index] !== second[index]) {
                return first[index] - second[index];
            }
        }
        return 0;
    }
}
