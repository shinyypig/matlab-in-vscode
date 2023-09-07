import os
import sys
import re
import argparse
from io import StringIO

# Check if the Matlab Engine is installed
try:
    import matlab.engine
    from matlab.engine import RejectedExecutionError as MatlabTerminated
except ImportError:
    print(
        "MATLAB Engine for Python cannot be detected. Please install it for the extension to work."
    )
    sys.exit(1)


class MatlabEngine:
    def __init__(self):
        argParser = argparse.ArgumentParser()
        argParser.add_argument(
            "-c",
            "--cmd",
            default="",
            help="The first line of code to execute upon opening the MATLAB session",
        )
        args = argParser.parse_args()

        # Bringup MATLAB Engine
        try:
            self.eng = matlab.engine.start_matlab()
            welcome_str = "MATLAB Engine for Python is ready (terminate with 'quit')"
            print("{0}\n{1}\n{0}".format("-" * len(welcome_str), welcome_str))
        except MatlabTerminated as e:
            print("MATLAB Engine for Python exited prematurely:\n{}".format(str(e)))
            sys.exit(1)

        # Run the startup command if specified
        if args.cmd:
            self.execute_command(args.cmd)

    def __del__(self):
        print("Terminating MATLAB Engine.")
        self.eng.quit()

    def clear(self):
        os.system("cls" if os.name == "nt" else "clear")

    def get_input(self) -> str:
        command = sys.stdin.readline()
        # Handle multi-line functionality for control structures:
        pattern = r"^[ \t]*(if|for|while|switch|try|parfor|function)\b"
        if re.search(pattern, command):
            while True:
                line = self.get_input()
                command += line + "\n"
                if line == "end":
                    print(command)
                    break
        elif command.rstrip().endswith("..."):
            line = self.get_input()
            command += line + "\n"
        return command.strip()

    def execute_command(self, command):
        try:
            stream = StringIO()
            err_stream = StringIO()
            self.eng.eval(command, nargout=0, stdout=stream, stderr=err_stream)
            if len(stream.getvalue()) > 0:
                print(stream.getvalue())
        except MatlabTerminated as e:
            print("MATLAB Engine for Python exited prematurely:\n{}".format(str(e)))
            print(stream.getvalue(), err_stream.getvalue(), sep="\n")
            sys.exit(1)
        except:  # The other exceptions are handled by MATLAB
            print(stream.getvalue(), err_stream.getvalue(), sep="\n")

    def interactive_loop(self):
        while True:
            # Await input command
            print("\r>>> ", end="")
            try:
                command = self.get_input()
            except KeyboardInterrupt:
                print("CTRL+C")
                continue

            # Keyword to terminate the engine
            if command == "quit" or command == "quit()":
                break
            # Keyword to clear terminal
            elif command == "clc" or command == "clc()":
                self.clear()
            # Evaluate command in MATLAB
            else:
                self.execute_command(command)


if __name__ == "__main__":
    matlab_engine = MatlabEngine()
    matlab_engine.interactive_loop()
