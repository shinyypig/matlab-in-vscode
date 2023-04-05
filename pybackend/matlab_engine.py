import os
import sys
import select
global import_fail
try:  # Check if the Matlab Engine is installed
    import matlab.engine
    from matlab.engine import RejectedExecutionError as MatlabTerminated
except ImportError:
    print("MATLAB Engine for Python cannot be detected. Please install it for the extension to work.")
    import_fail = True
else:
    import_fail = False


class MatlabEngine:
    def __init__(self):
        if not import_fail:
            try:
                self.eng = matlab.engine.start_matlab('-nodesktop -nosplash')
                print("MATLAB Engine for Python is ready.")
            except MatlabTerminated as e:
                print(str(e))
                print("MATLAB Engine for Python exited prematurely.")

    def clear(self):
        os.system('cls' if os.name == 'nt' else 'clear')

    def get_input(self):
        print('\r>>> ', end='')
        command = input()
        while True:
            rlist, _, _ = select.select([sys.stdin], [], [], 0.1)
            if rlist:
                command += '\n' + input()
            else:
                break
        return command

    def interactive_loop(self):
        loop = True
        while loop and not import_fail:
            try:
                command = self.get_input()
            except:
                pass

            if command == "quit" or command == "quit()":
                loop = False

            elif command == "clc" or command == "clc()":
                self.clear()

            else:
                try:
                    self.eng.eval(command, nargout=0)

                except MatlabTerminated:
                    print("MATLAB process terminated.")
                    print("Restarting MATLAB Engine for Python...")
                    self.eng = matlab.engine.start_matlab()
                    print("Restarted MATLAB process.")

                except:
                    pass

        if not import_fail:
            self.eng.quit()


if __name__ == '__main__':
    matlab_engine = MatlabEngine()
    matlab_engine.interactive_loop()
